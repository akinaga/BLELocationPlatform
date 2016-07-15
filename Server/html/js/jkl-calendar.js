//  ========================================================
//  jkl-calendar.js ---- �|�b�v�A�b�v�J�����_�[�\���N���X
//  Copyright 2005-2006 Kawasaki Yusuke <u-suke [at] kawa.net>
//  Thanks to 2tak <info [at] code-hour.com>
//  http://www.kawa.net/works/js/jkl/calender.html
//  2005/04/06 - �ŏ��̃o�[�W����
//  2005/04/10 - �O���X�^�C���V�[�g���g�p���Ȃ��AJKL.Opacity �̓I�v�V����
//  2006/10/22 - typo�C���Aspliter/min_date/max_date�v���p�e�B�A�~�{�^���ǉ�
//  2006/10/23 - prototype.js���p���́AEvent.observe()�ŃC�x���g�o�^
//  2006/10/24 - max_date �͈̓o�O�C��
//  2006/10/25 - �t�H�[���ɏ����l������΁A�J�����_�[�̏����l�ɍ̗p����
//  ========================================================

/***********************************************************
 //  �i�T���v���j�|�b�v�A�b�v����J�����_�[

 <html>
 <head>
 <script type="text/javascript" src="jkl-opacity.js" charset="Shift_JIS"></script>
 <script type="text/javascript" src="jkl-calendar.js" charset="Shift_JIS"></script>
 <script>
 var cal1 = new JKL.Calendar("calid","formid","colname");
 </script>
 </head>
 <body>
 <form id="formid" action="">
 <input type="text" name="colname" onClick="cal1.write();" onChange="cal1.getFormValue(); cal1.hide();"><br>
 <div id="calid"></div>
 </form>
 </body>
 </html>

 **********************************************************/

// �e�N���X

if (typeof(JKL) == 'undefined') JKL = function () {
};

// JKL.Calendar �R���X�g���N�^�̒�`

JKL.Calendar = function (eid, fid, valname) {
    this.eid = eid;
    this.formid = fid;
    this.valname = valname;
    this.__dispelem = null;  // �J�����_�[�\�����G�������g
    this.__textelem = null;  // �e�L�X�g���͗��G�������g
    this.__opaciobj = null;  // JKL.Opacity �I�u�W�F�N�g
    this.style = new JKL.Calendar.Style();
    return this;
};

// �o�[�W�����ԍ�

JKL.Calendar.VERSION = "0.13";

// �f�t�H���g�̃v���p�e�B

JKL.Calendar.prototype.spliter = "/";
JKL.Calendar.prototype.date = null;
JKL.Calendar.prototype.min_date = null;
JKL.Calendar.prototype.max_date = null;

// JKL.Calendar.Style

JKL.Calendar.Style = function () {
    return this;
};

// �f�t�H���g�̃X�^�C��

JKL.Calendar.Style.prototype.frame_width = "150px";      // �t���[������
JKL.Calendar.Style.prototype.frame_color = "#009900";    // �t���[���g�̐F
JKL.Calendar.Style.prototype.font_size = "12px";       // �����T�C�Y
JKL.Calendar.Style.prototype.day_bgcolor = "#F0F0F0";    // �J�����_�[�̔w�i�F
JKL.Calendar.Style.prototype.month_color = "#FFFFFF";    // ���N���������̔w�i�F
JKL.Calendar.Style.prototype.month_hover_color = "#009900";    // �}�E�X�I�[�o�[���́�╶���F
JKL.Calendar.Style.prototype.month_hover_bgcolor = "#FFFFCC";   // �}�E�X�I�[�o�[���́��w�i�F
JKL.Calendar.Style.prototype.weekday_color = "#009900";    // ���j�`���j���Z���̕����F
JKL.Calendar.Style.prototype.saturday_color = "#0040D0";    // �y�j���Z���̕����F
JKL.Calendar.Style.prototype.sunday_color = "#D00000";    // ���j���Z���̕����F
JKL.Calendar.Style.prototype.others_color = "#999999";    // ���̌��̓��Z���̕����F
JKL.Calendar.Style.prototype.day_hover_bgcolor = "#FF9933";    // �}�E�X�I�[�o�[���̓��Z���̔w�i
JKL.Calendar.Style.prototype.cursor = "pointer";    // �}�E�X�I�[�o�[���̃J�[�\���`��

//  ���\�b�h

JKL.Calendar.Style.prototype.set = function (key, val) {
    this[key] = val;
}
JKL.Calendar.Style.prototype.get = function (key) {
    return this[key];
}
JKL.Calendar.prototype.setStyle = function (key, val) {
    this.style.set(key, val);
};
JKL.Calendar.prototype.getStyle = function (key) {
    return this.style.get(key);
};

// ���t������������

JKL.Calendar.prototype.initDate = function (dd) {
    if (!dd) dd = new Date();
    var year = dd.getFullYear();
    var mon = dd.getMonth();
    var date = dd.getDate();
    this.date = new Date(year, mon, date);
    this.getFormValue();
    return this.date;
}

// �����x�ݒ�̃I�u�W�F�N�g��Ԃ�

JKL.Calendar.prototype.getOpacityObject = function () {
    if (this.__opaciobj) return this.__opaciobj;
    var cal = this.getCalendarElement();
    if (!JKL.Opacity) return;
    this.__opaciobj = new JKL.Opacity(cal);
    return this.__opaciobj;
};

// �J�����_�[�\�����̃G�������g��Ԃ�

JKL.Calendar.prototype.getCalendarElement = function () {
    if (this.__dispelem) return this.__dispelem;
    this.__dispelem = document.getElementById(this.eid)
    return this.__dispelem;
};

// �e�L�X�g���͗��̃G�������g��Ԃ�

JKL.Calendar.prototype.getFormElement = function () {
    if (this.__textelem) return this.__textelem;
    var frmelms = document.getElementById(this.formid);
    if (!frmelms) return;
    for (var i = 0; i < frmelms.elements.length; i++) {
        if (frmelms.elements[i].name == this.valname) {
            this.__textelem = frmelms.elements[i];
        }
    }
    return this.__textelem;
};

// �I�u�W�F�N�g�ɓ��t���L������iYYYY/MM/DD�`���Ŏw�肷��j

JKL.Calendar.prototype.setDateYMD = function (ymd) {
    var splt = ymd.split(this.spliter);
    if (splt[0] - 0 > 0 &&
        splt[1] - 0 >= 1 && splt[1] - 0 <= 12 &&       // bug fix 2006/03/03 thanks to ucb
        splt[2] - 0 >= 1 && splt[2] - 0 <= 31) {
        if (!this.date) this.initDate();
        this.date.setFullYear(splt[0]);
        this.date.setMonth(splt[1] - 1);
        this.date.setDate(splt[2]);
    } else {
        ymd = "";
    }
    return ymd;
};

// �I�u�W�F�N�g������t�����o���iYYYY/MM/DD�`���ŕԂ�j
// ������ Date �I�u�W�F�N�g�̎w�肪����΁A
// �I�u�W�F�N�g�͖������āA�����̓��t���g�p����i�P�Ȃ�fprint�@�\�j

JKL.Calendar.prototype.getDateYMD = function (dd) {
    if (!dd) {
        if (!this.date) this.initDate();
        dd = this.date;
    }
    var mm = "" + (dd.getMonth() + 1);
    var aa = "" + dd.getDate();
    if (mm.length == 1) mm = "" + "0" + mm;
    if (aa.length == 1) aa = "" + "0" + aa;
    return dd.getFullYear() + this.spliter + mm + this.spliter + aa;
};

// �e�L�X�g���͗��̒l��Ԃ��i���łɃI�u�W�F�N�g���X�V����j

JKL.Calendar.prototype.getFormValue = function () {
    var form1 = this.getFormElement();
    if (!form1) return "";
    var date1 = this.setDateYMD(form1.value);
    return date1;
};

// �t�H�[�����͗��Ɏw�肵���l����������

JKL.Calendar.prototype.setFormValue = function (ymd) {
    if (!ymd) ymd = this.getDateYMD();   // ���w�莞�̓I�u�W�F�N�g����H
    var form1 = this.getFormElement();
    if (form1) form1.value = ymd;
};

//  �J�����_�[�\������\������

JKL.Calendar.prototype.show = function () {
    this.getCalendarElement().style.display = "";
};

//  �J�����_�[�\�����𑦍��ɉB��

JKL.Calendar.prototype.hide = function () {
    this.getCalendarElement().style.display = "none";
};

//  �J�����_�[�\�������t�F�[�h�A�E�g����

JKL.Calendar.prototype.fadeOut = function (s) {
    if (JKL.Opacity) {
        this.getOpacityObject().fadeOut(s);
    } else {
        this.hide();
    }
};

// ���P�ʂňړ�����

JKL.Calendar.prototype.moveMonth = function (mon) {
    // �O�ֈړ�
    if (!this.date) this.initDate();
    for (; mon < 0; mon++) {
        this.date.setDate(1);   // ����1����1���O�͕K���O�̌�
        this.date.setTime(this.date.getTime() - (24 * 3600 * 1000));
    }
    // ��ֈړ�
    for (; mon > 0; mon--) {
        this.date.setDate(1);   // ����1����32����͕K�����̌�
        this.date.setTime(this.date.getTime() + (24 * 3600 * 1000) * 32);
    }
    this.date.setDate(1);       // ������1���ɖ߂�
    this.write();    // �`�悷��
};

// �C�x���g��o�^����

JKL.Calendar.prototype.addEvent = function (elem, ev, func) {
//  prototype.js ������Η��p����(IE���������[�N���)
    if (window.Event && Event.observe) {
        Event.observe(elem, ev, func, false);
    } else {
        elem["on" + ev] = func;
    }
}

// �J�����_�[��`�悷��

JKL.Calendar.prototype.write = function () {
    var date = new Date();
    if (!this.date) this.initDate();
    date.setTime(this.date.getTime());

    var year = date.getFullYear();          // �w��N
    var mon = date.getMonth();             // �w�茎
    var today = date.getDate();             // �w���
    var form1 = this.getFormElement();

    // �I���\�ȓ��t�͈�
    var min;
    if (this.min_date) {
        var tmp = new Date(this.min_date.getFullYear(),
            this.min_date.getMonth(), this.min_date.getDate());
        min = tmp.getTime();
    }
    var max;
    if (this.max_date) {
        var tmp = new Date(this.max_date.getFullYear(),
            this.max_date.getMonth(), this.max_date.getDate());
        max = tmp.getTime();
    }

    // ���O�̌��j���܂Ŗ߂�
    date.setDate(1);                        // 1���ɖ߂�
    var wday = date.getDay();               // �j�� ���j(0)�`�y�j(6)
    if (wday != 1) {
        if (wday == 0) wday = 7;
        date.setTime(date.getTime() - (24 * 3600 * 1000) * (wday - 1));
    }

    // �ő��7���~6�T�ԁ�42�����̃��[�v
    var list = new Array();
    for (var i = 0; i < 42; i++) {
        var tmp = new Date();
        tmp.setTime(date.getTime() + (24 * 3600 * 1000) * i);
        if (i && i % 7 == 0 && tmp.getMonth() != mon) break;
        list[list.length] = tmp;
    }

    // �X�^�C���V�[�g�𐶐�����
    var month_table_style = 'width: 100%; ';
    month_table_style += 'background: ' + this.style.frame_color + '; ';
    month_table_style += 'border: 1px solid ' + this.style.frame_color + ';';

    var week_table_style = 'width: 100%; ';
    week_table_style += 'background: ' + this.style.day_bgcolor + '; ';
    week_table_style += 'border-left: 1px solid ' + this.style.frame_color + '; ';
    week_table_style += 'border-right: 1px solid ' + this.style.frame_color + '; ';

    var days_table_style = 'width: 100%; ';
    days_table_style += 'background: ' + this.style.day_bgcolor + '; ';
    days_table_style += 'border: 1px solid ' + this.style.frame_color + '; ';

    var month_td_style = "";
    month_td_style += 'font-size: ' + this.style.font_size + '; ';
    month_td_style += 'color: ' + this.style.month_color + '; ';
    month_td_style += 'padding: 4px 0px 2px 0px; ';
    month_td_style += 'text-align: center; ';
    month_td_style += 'font-weight: bold;';

    var week_td_style = "";
    week_td_style += 'font-size: ' + this.style.font_size + '; ';
    week_td_style += 'padding: 2px 0px 2px 0px; ';
    week_td_style += 'font-weight: bold;';
    week_td_style += 'text-align: center;';

    var days_td_style = "";
    days_td_style += 'font-size: ' + this.style.font_size + '; ';
    days_td_style += 'padding: 1px; ';
    days_td_style += 'text-align: center; ';
    days_td_style += 'font-weight: bold;';

    var days_unselectable = "font-weight: normal;";

    // HTML�\�[�X�𐶐�����
    var src1 = "";

    src1 += '<table border="0" cellpadding="0" cellspacing="0" style="' + month_table_style + '"><tr>';
    src1 += '<td id="__' + this.eid + '_btn_prev" title="�O�̌���" style="' + month_td_style + '">��</td>';
    src1 += '<td style="' + month_td_style + '">&nbsp;</td>';
    src1 += '<td style="' + month_td_style + '">' + (year) + '�N ' + (mon + 1) + '��</td>';
    src1 += '<td id="__' + this.eid + '_btn_close" title="����" style="' + month_td_style + '">�~</td>';
    src1 += '<td id="__' + this.eid + '_btn_next" title="���̌���" style="' + month_td_style + '">��</td>';
    src1 += "</tr></table>\n";
    src1 += '<table border="0" cellpadding="0" cellspacing="0" style="' + week_table_style + '"><tr>';
    src1 += '<td style="color: ' + this.style.weekday_color + '; ' + week_td_style + '">��</td>';
    src1 += '<td style="color: ' + this.style.weekday_color + '; ' + week_td_style + '">��</td>';
    src1 += '<td style="color: ' + this.style.weekday_color + '; ' + week_td_style + '">��</td>';
    src1 += '<td style="color: ' + this.style.weekday_color + '; ' + week_td_style + '">��</td>';
    src1 += '<td style="color: ' + this.style.weekday_color + '; ' + week_td_style + '">��</td>';
    src1 += '<td style="color: ' + this.style.saturday_color + '; ' + week_td_style + '">�y</td>';
    src1 += '<td style="color: ' + this.style.sunday_color + '; ' + week_td_style + '">��</td>';
    src1 += "</tr></table>\n";
    src1 += '<table border="0" cellpadding="0" cellspacing="0" style="' + days_table_style + '">';

    var curutc;
    if (form1 && form1.value) {
        var splt = form1.value.split(this.spliter);
        if (splt[0] > 0 && splt[2] > 0) {
            var curdd = new Date(splt[0] - 0, splt[1] - 1, splt[2] - 0);
            curutc = curdd.getTime();                           // �t�H�[����̓���
        }
    }

    for (var i = 0; i < list.length; i++) {
        var dd = list[i];
        var ww = dd.getDay();
        var mm = dd.getMonth();
        if (ww == 1) {
            src1 += "<tr>";                                     // ���j���̑O�ɍs��
        }
        var cc = days_td_style;
        if (mon == mm) {
            if (ww == 0) {
                cc += "color: " + this.style.sunday_color + ";";    // �����̓��j��
            } else if (ww == 6) {
                cc += "color: " + this.style.saturday_color + ";";  // �����̓y�j��
            } else {
                cc += "color: " + this.style.weekday_color + ";";   // �����̕���
            }
        } else {
            cc += "color: " + this.style.others_color + ";";        // �O�����Ɨ������̓��t
        }
        var utc = dd.getTime();
        if (( min && min > utc ) || ( max && max < utc )) {
            cc += days_unselectable;
        }
        if (utc == curutc) {                                  // �t�H�[����̓���
            cc += "background: " + this.style.day_hover_bgcolor + ";";
        }

        var ss = this.getDateYMD(dd);
        var tt = dd.getDate();
        src1 += '<td style="' + cc + '" title=' + ss + ' id="__' + this.eid + '_td_' + ss + '">' + tt + '</td>';
        if (ww == 7) {
            src1 += "</tr>\n";                                  // �y�j���̌�ɍs��
        }
    }
    src1 += "</table>\n";

    // �J�����_�[������������
    var cal1 = this.getCalendarElement();
    if (!cal1) return;
    cal1.style.width = this.style.frame_width;
    cal1.style.position = "absolute";
    cal1.innerHTML = src1;

    // �C�x���g��o�^����
    var __this = this;
    var get_src = function (ev) {
        ev = ev || window.event;
        var src = ev.target || ev.srcElement;
        return src;
    };
    var month_onmouseover = function (ev) {
        var src = get_src(ev);
        src.style.color = __this.style.month_hover_color;
        src.style.background = __this.style.month_hover_bgcolor;
    };
    var month_onmouseout = function (ev) {
        var src = get_src(ev);
        src.style.color = __this.style.month_color;
        src.style.background = __this.style.frame_color;
    };
    var day_onmouseover = function (ev) {
        var src = get_src(ev);
        src.style.background = __this.style.day_hover_bgcolor;
    };
    var day_onmouseout = function (ev) {
        var src = get_src(ev);
        src.style.background = __this.style.day_bgcolor;
    };
    var day_onclick = function (ev) {
        var src = get_src(ev);
        var srcday = src.id.substr(src.id.length - 10);
        __this.setFormValue(srcday);
        __this.fadeOut(1.0);
    };

    // �O�̌��փ{�^��
    var tdprev = document.getElementById("__" + this.eid + "_btn_prev");
    tdprev.style.cursor = this.style.cursor;
    this.addEvent(tdprev, "mouseover", month_onmouseover);
    this.addEvent(tdprev, "mouseout", month_onmouseout);
    this.addEvent(tdprev, "click", function () {
        __this.moveMonth(-1);
    });

    // ����{�^��
    var tdclose = document.getElementById("__" + this.eid + "_btn_close");
    tdclose.style.cursor = this.style.cursor;
    this.addEvent(tdclose, "mouseover", month_onmouseover);
    this.addEvent(tdclose, "mouseout", month_onmouseout);
    this.addEvent(tdclose, "click", function () {
        __this.hide();
    });

    // ���̌��փ{�^��
    var tdnext = document.getElementById("__" + this.eid + "_btn_next");
    tdnext.style.cursor = this.style.cursor;
    this.addEvent(tdnext, "mouseover", month_onmouseover);
    this.addEvent(tdnext, "mouseout", month_onmouseout);
    this.addEvent(tdnext, "click", function () {
        __this.moveMonth(+1);
    });

    // �Z�����Ƃ̃C�x���g��o�^����
    for (var i = 0; i < list.length; i++) {
        var dd = list[i];
        if (mon != dd.getMonth()) continue;       // �����̃Z���ɂ̂ݐݒ肷��

        var utc = dd.getTime();
        if (min && min > utc) continue;           // �̉߂���
        if (max && max < utc) continue;           // �����߂���
        if (utc == curutc) continue;              // �t�H�[����̓���

        var ss = this.getDateYMD(dd);
        var cc = document.getElementById("__" + this.eid + "_td_" + ss);
        if (!cc) continue;

        cc.style.cursor = this.style.cursor;
        this.addEvent(cc, "mouseover", day_onmouseover);
        this.addEvent(cc, "mouseout", day_onmouseout);
        this.addEvent(cc, "click", day_onclick);
    }

    // �\������
    this.show();
};

// ���o�[�W�����݊��itypo�j
JKL.Calendar.prototype.getCalenderElement = JKL.Calendar.prototype.getCalendarElement;
JKL.Calender = JKL.Calendar;
