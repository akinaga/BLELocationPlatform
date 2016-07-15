#!/usr/bin/python
# -*- coding: utf-8 -*-

import cgi
import pgdb
import sys
from hashlib import md5
import csv
import cgitb
cgitb.enable()

# Define variables
tablename = "ping_data"
template_html = 'easy_monitor.template.htm'
template_js = 'easy_monitor.skelton.js'

from_date = ""
to_date = ""

from_date_field = ""
to_date_field = ""

target = []
metric = "cpu"

span = "7 days"
func = "avg"
gran = "hour"

# DB Connection
connector = pgdb.connect(host="127.0.0.1", database="postgres", user="postgres", password="postgres")
cursor = connector.cursor()

# --------------


def simple_retreive(sql):
    cursor.execute(sql)
    sys.stderr.write(sql+"\n")
    summary = cursor.fetchall()
    dat = ""
    for data in summary:
        dat = str(data[0])
    return dat


def columnname(sql, target):
    cursor.execute(sql)
    sys.stderr.write(sql+"\n")
    colname = cursor.description
    dat = ""
    for data in colname:
        if target == str(data[0]):
            dat += '<option value="'+str(data[0])+'" selected>'+str(data[0])+'</option>\n'
        else:
            dat += '<option value="'+str(data[0])+'">'+str(data[0])+'</option>\n'
    return dat

def datalist(sql,target,style):
    cursor.execute(sql)
    sys.stderr.write(sql+"\n")
    summary = cursor.fetchall()
    dat = ""
    for data in summary:
        name = str(data[0])
        id = str(data[1])

        if name == '' and id == '' and len(target) == 0:
            dat += '<option value="''" selected>Unselected</option>\n'
        elif name == '' and id == '':
            dat += '<option value="''">Unselected</option>\n'
        elif style == 1:
            if target == id:
                dat += '<option value="'+id+'" selected>' + name + '</option>\n'
            else:
                dat += '<option value="'+id+'">' + name + '</option>\n'
        elif style == 2:
            if target == id:
                dat += '<option value="'+id+'" selected>' + id + " ("+name+")"+'</option>\n'
            else:
                dat += '<option value="'+id+'">' + id + " ("+name+")"+'</option>\n'
        elif style == 3:
            if target == name:
                dat += '<option value="'+id+'" selected>' + name + '</option>\n'
            else:
                dat += '<option value="'+id+'">' + name + '</option>\n'
        elif style == 4:
            if name in target:
                dat += '<option value="'+id+'" selected>' + name + '</option>\n'
            else:
                dat += '<option value="'+id+'">' + name + '</option>\n'
    return dat

#--------------

def line_chart():
    try:
        sql = "select locationid, date_trunc('" + gran + "',recorddate), " + func + "(" + metric +") from easy_monitor as a "
        # sql += " where server is not null "
        sql += " where locationid !='' and " + metric + " is not null "
        if len(target) != 0:
            sql += " and ("
            for dat in target:
                sql += "server = '" + dat + "'"
                if dat != target[len(target)-1]:
                    sql += " or "
            sql += ") "
        if from_date and to_date:
            sql += " and recorddate >= '"+from_date+"'::date and recorddate <='"+to_date+"'::date+'1 day'::interval "
        else:
            sql += " and recorddate >= current_timestamp - '" + span + "'::interval "
        sql = sql + " group by 1,2 order by 1,2;"

        sys.stderr.write(sql+"\n")

        cache_key = md5(sql.replace("\n", "")).hexdigest()
        cache_filename = "cache/"+cache_key

        cursor.execute(sql)
        summary = cursor.fetchall()

        csvfilename = cache_filename + '.csv'
        csvwriter = csv.writer(open(csvfilename, 'wb'), dialect='excel')
        csvwriter.writerows(summary)

        dat=""
        tmp_col_name="**************"

        for data in summary:
            col_name = str(data[0])
            col_daytime = str(data[1]).split(' ')
            col_date = str(col_daytime[0]).split('-')
            col_time = str(col_daytime[1]).split(':')
            col_val = str(round(float(data[2]),2))
            if data[2]>0:
                utc_date="[Date.UTC("+str(int(col_date[0]))+","+str(int(col_date[1])-1)+","+str(int(col_date[2]))+","+str(int(col_time[0]))+","+str(int(col_time[1]))+","+str(int(col_time[2]))+"),"+col_val+"]\n"
                if tmp_col_name!=col_name:
                    if dat!='':
                        dat=dat+"]},"
                    dat=dat+"{ name:'" + col_name + "'\n,data: ["
                    dat=dat+utc_date
                else:
                    dat=dat+","+utc_date
                tmp_col_name=col_name

        dat = dat + "]}\n"

        f = open(template_js, 'r')
        js_body = f.read()
        f.close()
        js_str = js_body.replace("//**data**",dat)

    except:
        js_str = 'document.write("<p align=center>Database Error.</p>");'
        raise

    return js_str, csvfilename


# Form value
form = cgi.FieldStorage()
if 'target' in form:
    target = form.getlist('target')
    sys.stderr.write(str(target) + "\n")
if 'gran' in form:
    gran = simple_retreive("select gran from gran_list where id='" + str(form['gran'].value) + "';")
if 'span' in form:
    span = simple_retreive("select span from span_list where id='" + str(form['span'].value) + "';")
if 'func' in form:
    func = simple_retreive("select func from func_list where id='" + str(form['func'].value) + "';")
if 'metric' in form:
    metric = str(form['metric'].value)

sys.stderr.write(gran+" / "+span+" / "+func+"\n")

if 'from_date' in form:
    from_date = str(form['from_date'].value)
if 'to_date' in form:
    to_date = str(form['to_date'].value)

# Make graph
csvfilename = ""
js_str, csvfilename = line_chart()

title = "Monitoring " + simple_retreive("select metric from metric_list where id='" + metric + "';") + " usage for servers"
subtitle = "Within " + span

if metric == 'cpu' or metric == 'mem' or metric == 'disk_usage':
    yaxis = "Usage [%]"
else:
    yaxis = "Throughput [kbps]"
js_str = js_str.replace("***yaxis***",yaxis)

# Show target
try:
    target_list = datalist("select distinct locationid, locationid from easy_monitor where recorddate >= current_timestamp - '" + span + "'::interval union select '','' order by 1;", target, 4)
    span_list = datalist("select span,id from span_list;", span, 3)
    func_list = datalist("select func,id from func_list;", func, 3)
    gran_list = datalist("select gran,id from gran_list;", gran, 3)
    metric_list = datalist("select metric,id from metric_list;", metric, 1)

    if from_date and to_date:
        from_date_field = from_date
        to_date_field = to_date

    f = open(template_html, 'r')
    html = f.read()
    f.close()
    html = html.replace("**metric**", metric_list).replace("**target**", target_list).replace("**span**", span_list).replace("**func**", func_list).replace("**gran**", gran_list).replace("**from_date_field**",from_date_field).replace("**to_date_field**",to_date_field)

except:
    js_str = 'document.write("<p align=center>Database Error.</p>");'
    raise

html = html.replace("//**Java Scripts**",js_str).replace("**csvfilename**",csvfilename).replace("**title**",title).replace("**subtitle**",subtitle)

print "Content-type: text/html\n"
print html
