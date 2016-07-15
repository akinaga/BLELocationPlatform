#!/usr/bin/python
# -*- coding: utf-8 -*-

import cgi
import os
import sys
import pgdb
from hashlib import md5
import csv
import datetime
import cgitb
import glob
import codecs
cgitb.enable()

#DB Connection
connector = pgdb.connect(host="127.0.0.1",database="postgres",user="postgres",password="postgres")
cursor = connector.cursor()
template_html = "base.html"
tablename = "bletags"

title = "BLE tag logger"
# current_user = os.environ["REMOTE_USER"]
# --------------
additional_js = ""

def display():
    sql = """
        select distinct a.ble_id,md5(a.ble_id) as ble_md5, (case when c.ble_name is null then '' else c.ble_name end) as ble_name
        , a.recorddate, b.locationname, a.rssi
        from ble_location as a
        inner join (select ble_id, max(recorddate) as recorddate from ble_location group by ble_id) as e
        on (a.ble_id=e.ble_id and a.recorddate=e.recorddate)
        left outer join basestation as b on (a.locationid=b.locationid)
        left outer join bletags as c on (a.ble_id=c.ble_id)
        order by 1;
    """
    sys.stderr.write(sql+"\n")
    cursor.execute(sql)
    summary = cursor.fetchall()
    return summary

# --------------
# Form value
form = cgi.FieldStorage()
# sys.stderr.write(str(form.keys()) + "\n")

if 'mode' in form:
    mode = str(form.getfirst('mode'))
    sys.stderr.write(str(mode) + "\n")
    if mode == 'reg':
        summary = display()
        sql = "truncate " + tablename + ";"
        cursor.execute(sql)

        for data in summary:
            bletagID = str(data[0])
            bleMD5ID = str(data[1])
            bletagName = str(data[2])

            if 'com_' + bleMD5ID in form:
                # linkedComment = auth.filter(str(form.getfirst('com_' + linkedID)))
                locationName = str(form.getfirst('com_' + bleMD5ID))
                sql = "insert into " + tablename + " (ble_id, ble_name) values (%s,%s);"
                params = [bletagID, bletagName]
                cursor.execute(sql, params)

        connector.commit()
        cursor.close
        additional_js = "function msg_disp(){window.alert('変更しました');}"

# HTML Making
summary = display()
html = '<form name="download1" method="POST"><input type="hidden" name="download" value="1"></form>'
html += '<form action="***SCRIPT***" name="myform" method="POST" target="_self">'
html += '<table class="t1" width="1200px">'
html += "<tr>" \
        "<th>Tag Address</th>" \
        "<th>Tag Name</th>" \
        "<th>Last BLE Sense</th>" \
        "<th>Last Location</th>" \
        "<th>Local Signal Strength<br>(dbm)</th>" \
        "</tr><tr>"
for data in summary:
    bletagID = str(data[0])
    bleMD5ID = str(data[1])
    bletagName = str(data[2])
    BLERecDate = str(data[3])
    BLElocationName = str(data[4])
    BLERSSI = str(data[5])

    html += "<tr>"
    html += "<td style='text-align: center' nowrap>" + bletagID + '</td>'
    html += '<td><input type="text" name="com_' + bleMD5ID + '" size="30" value="'
    html += bletagName
    html += '" autocomplete="off"></td>'
    html += "<td style='text-align: center' nowrap>" + BLERecDate + '</td>'
    html += "<td style='text-align: center' nowrap>" + BLElocationName + '</td>'
    html += "<td style='text-align: center' nowrap>" + BLERSSI + '</td>'
    html += "</tr>"
html += "</table>"
html += '<input type="hidden" name="mode" value="reg">'
html += "<p><input type='submit' value='Save' onClick='reg_disp()' style='WIDTH: 350px; HEIGHT: 40px'>"
html += '</form>'

html += "</td></tr>" \
        '<tr><td height="150px">'

html += "</td></tr>"
html += "<tr><td><hr></td></tr>"

html = html.replace("***SCRIPT***", os.path.basename(__file__))

# Show target
f = open(template_html, 'r')
bottom_html_skel = f.read()
f.close()
html = bottom_html_skel.replace("**title**", title).replace("**MAIN**", html).replace("//**additional**", additional_js)

# Final assemble
print "Content-type: text/html\n"
print html

