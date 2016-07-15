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

title = "Basestation Setup"
# current_user = os.environ["REMOTE_USER"]
# --------------
additional_js = ""
tablename = "basestation"

def display():
    sql = """
    select distinct a.locationid, (case when d.locationname is null then '' else d.locationname end) as locationname, a.recorddate, c.recorddate, c.localip, c.globalip, c.cpu_temp
        from ble_location as a
        INNER join
          (select locationid,max(recorddate) as recorddate from ble_location group by 1) as b
          on (a.locationid=b.locationid and a.recorddate=b.recorddate)
        INNER join
          (select a.locationid, a.localip, a.globalip, b.recorddate, a.cpu_temp from easy_monitor as a
          inner join
            (select locationid,max(recorddate) as recorddate from easy_monitor group by 1) as b
          on (a.locationid=b.locationid and a.recorddate=b.recorddate)
          ) as c
          on (a.locationid=c.locationid)
        left OUTER join basestation as d on (a.locationid=d.locationid)
        order by locationid;
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
            locationID = str(data[0])
            locationName = str(data[1])

            if 'com_' + locationID in form:
                # linkedComment = auth.filter(str(form.getfirst('com_' + linkedID)))
                locationName = str(form.getfirst('com_' + locationID))
                sql = "insert into " + tablename + " (locationid, locationname) values (%s,%s);"
                params = [locationID, locationName]
                cursor.execute(sql, params)

        connector.commit()
        cursor.close
        additional_js = "function msg_disp(){window.alert('変更しました');}"

# HTML Making
summary = display()
html = '<form name="download1" method="POST"><input type="hidden" name="download" value="1"></form>'
html += '<form action="***SCRIPT***" name="myform" method="POST" target="_self">'
# html += '<h2>' + title + '</h2><p>'
html += '<table class="t1" width="1200px">'
html += "<tr>" \
        "<th>Serial No.</th>" \
        "<th>Location Name</th>" \
        "<th>Last BLE Sense</th>" \
        "<th>Last Status Report</th>" \
        "<th>Local IP</th>" \
        "<th>Global IP</th>" \
        "<th>CPU Temp.</th>" \
        "</tr><tr>"
for data in summary:
    locationID = str(data[0])
    locationName = str(data[1])
    locationBLERecDate = str(data[2])
    locationStatusDate = str(data[3])
    locationLocalIP = str(data[4])
    locationGlobalIP = str(data[5])
    locationCPUtemp = str(data[6])

    html += "<tr>"
    html += "<td style='text-align: center' nowrap>" + locationID + '</td>'
    html += '<td><input type="text" name="com_' + locationID + '" size="30" value="'
    html += locationName
    html += '" autocomplete="off"></td>'
    html += "<td style='text-align: center' nowrap>" + locationBLERecDate + '</td>'
    html += "<td style='text-align: center' nowrap>" + locationStatusDate + '</td>'
    html += "<td style='text-align: center' nowrap>" + locationLocalIP + '</td>'
    html += "<td style='text-align: center' nowrap>" + locationGlobalIP + '</td>'
    html += "<td style='text-align: center' nowrap>" + locationCPUtemp + '</td>'
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

