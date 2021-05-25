/* Developed by https://github.com/285187 */
// init
var label_columns = [];
var label_rows = [];
var customfields_columns = [];
var used_columns = [];
var cardname1 = '';
var cardname2 = '';
var desription = '';
var create_confirm = false;
var excelheader = [];
var excelbody = [];
$("#loadingdiv").hide();

// functions
var WriteTable = function(table_header, table_body) {
    excelheader = table_header;
    excelbody = table_body;

    var table = $("#table")[0];
    table.innerHTML = "";
    // thead
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    thead.append(tr);
    table_header.map((val) => {
        var th = document.createElement("th");
        th.className = "sortable";
        var label = document.createElement("label");
        label.innerHTML = val;
        label.style.cursor = "pointer";
        th.append(label);

        tr.append(th);
    });
    table.append(thead);

    // tbody
    var tbody = document.createElement("tbody");

    table_body.map((rowval) => {
        var tr = document.createElement("tr");
        rowval.map((val) => {
            var td = document.createElement("td");
            td.innerHTML = String(val);
            tr.append(td);
        });
        tbody.append(tr);
    });
    table.append(tbody);
};

var WriteElements = function(columns) {
    var cardname1_sel = $("#cardname1");
    cardname1_sel.on("change", function() {
        var data = this.value;
        if (used_columns.indexOf(data) == -1) {
            if (cardname1 == "") {
                used_columns.push(data);
            } else {
                used_columns.splice(used_columns.indexOf(cardname1), 1);
                used_columns.push(data);
            }
            cardname1 = data;
        } else {
            alert("This columns was selected already");
            this.value = "";
        }
    })
    var cardname2_sel = $("#cardname2");
    cardname2_sel.on("change", function() {
        var data = this.value;
        if (used_columns.indexOf(data) == -1) {
            if (cardname2 == "") {
                used_columns.push(data);
            } else {
                used_columns.splice(used_columns.indexOf(cardname2), 1);
                used_columns.push(data);
            }
            cardname2 = data;
        } else {
            alert("This columns was selected already");
            this.value = "";
        }
    })
    var description_sel = $("#description");
    description_sel.on("change", function() {
        var data = this.value;
        if (used_columns.indexOf(data) == -1) {
            if (description == "") {
                used_columns.push(data);
            } else {
                used_columns.splice(used_columns.indexOf(description), 1);
                used_columns.push(data);
            }
            description = data;
        } else {
            alert("This columns was selected already");
            this.value = "";
        }
    })
    var labelul = $("#labelul");
    var customfields_ul = $("#customfieldul");
    columns.map((val, idx) => {
        // cardname1
        var option = document.createElement("option");
        option.value = val;
        option.innerHTML = val;
        cardname1_sel.append(option);
        // cardname2
        var option = document.createElement("option");
        option.value = val;
        option.innerHTML = val;
        cardname2_sel.append(option);
        // description
        var option = document.createElement("option");
        option.value = val;
        option.innerHTML = val;
        description_sel.append(option);
        // labels
        var chk = document.createElement("input");
        chk.type = "checkbox";
        chk.className = "custom-control-input";
        chk.id = "label_chk_" + String(idx);
        chk.setAttribute("data", val);
        chk.addEventListener("click", function() {
            var data = this.getAttribute("data");
            if (this.checked == true) {
                if (used_columns.indexOf(data) == -1) {
                    if (label_columns.length == 0) {
                        label_columns.push(data);
                        used_columns.push(data);
                    } else {
                        alert("You can select only 1 column at most for the labels");
                        this.checked = false;
                    }
                } else {
                    alert("This columns was selected already");
                    this.checked = false;
                }
            } else {
                label_columns.splice(label_columns.indexOf(data), 1);
                used_columns.splice(used_columns.indexOf(data), 1);
            }
        });
        var lbl = document.createElement("label");
        lbl.className = "custom-control-label";
        lbl.textContent = val;
        lbl.setAttribute("for", "label_chk_" + String(idx));
        var div = document.createElement("div");
        div.className = "custom-control custom-checkbox";
        div.append(chk);
        div.append(lbl);
        var li = document.createElement("li");
        li.className = "list-group-item";
        li.append(div);
        labelul.append(li);
        // customfields
        var chk = document.createElement("input");
        chk.type = "checkbox";
        chk.className = "custom-control-input";
        chk.id = "customfields_chk_" + String(idx);
        chk.setAttribute("data", val);
        chk.addEventListener("click", function() {
            var data = this.getAttribute("data");
            if (this.checked == true) {
                if (used_columns.indexOf(data) == -1) {
                    customfields_columns.push(data);
                    used_columns.push(data);
                } else {
                    alert("This column was already selected");
                    this.checked = false;
                }
            } else {
                customfields_columns.splice(customfields_columns.indexOf(data), 1);
                used_columns.splice(used_columns.indexOf(data), 1);
            }
        });
        var lbl = document.createElement("label");
        lbl.className = "custom-control-label";
        lbl.textContent = val;
        lbl.setAttribute("for", "customfields_chk_" + String(idx));
        var div = document.createElement("div");
        div.className = "custom-control custom-checkbox";
        div.append(chk);
        div.append(lbl);
        var li = document.createElement("li");
        li.className = "list-group-item";
        li.append(div);
        customfields_ul.append(li);
    });
};

function validationDate(str) {
    var m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    return m ? true : false;
}

function ExcelDateToJSDate(date) {
    return new Date(Math.round((date - 25569) * 86400 * 1000)).toJSON();
}
var ExcelToJSON = function() {
    this.parseExcel = function(file) {
        var excelheader = [
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
            "AA",
            "AB",
            "AC",
            "AD",
            "AE",
            "AF",
            "AG",
            "AH",
            "AI",
            "AJ",
            "AK",
            "AL",
            "AM",
            "AN",
            "AO",
            "AP",
            "AQ",
            "AR",
            "AS",
            "AT",
            "AU",
            "AV",
            "AW",
            "AX",
            "AY",
            "AZ",
            "BA",
            "BB",
            "BC",
            "BD",
            "BE",
            "BF",
            "BG",
            "BH",
            "BI",
            "BJ",
            "BK",
            "BL",
            "BM",
            "BN",
            "BO",
            "BP",
            "BQ",
            "BR",
            "BS",
            "BT",
            "BU",
            "BV",
            "BW",
            "BX",
            "BY",
            "BZ",
            "CA",
            "CB",
            "CC",
            "CD",
            "CE",
            "CF",
            "CG",
            "CH",
            "CI",
            "CJ",
            "CK",
            "CL",
            "CM",
            "CN",
            "CO",
            "CP",
            "CQ",
            "CR",
            "CS",
            "CT",
            "CU",
            "CV",
            "CW",
            "CX",
            "CY",
            "CZ",
        ];
        var table_body = [];
        if (file != undefined) {
            var fileext = file.name.split(".").pop();
            if (["xls", "xlsx"].indexOf(fileext) < 0) {
                alert("Invalid file format!");
            } else {
                var reader = new FileReader();
                reader.onload = function(e) {
                    var data = e.target.result;
                    var workbook = XLSX.read(data, {
                        type: "binary",
                        cellDates: true,
                    });

                    workbook.SheetNames.forEach(function(sheetName) {
                        // Get headers.
                        var table_header = [];
                        var sheet = workbook.Sheets[sheetName];
                        var range = XLSX.utils.decode_range(sheet["!ref"]);
                        var C,
                            R = range.s.r;
                        /* start in the first row */
                        /* walk every column in the range */
                        for (C = range.s.c; C <= range.e.c; ++C) {
                            var cell = sheet[XLSX.utils.encode_cell({ c: C, r: R })];
                            /* find the cell in the first row */

                            // var hdr = "UNKNOWN " + C; // <-- replace with your desired default
                            if (cell && cell.t) {
                                hdr = XLSX.utils.format_cell(cell);
                                table_header.push(hdr);
                            }
                        }
                        // For each sheets, convert to json.
                        var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
                            date_format: "dd/mm/yyyy",
                        });
                        if (roa.length > 0) {
                            roa.forEach(function(row) {
                                // Set empty cell to ''.
                                rowdata = [];
                                table_header.forEach(function(hd) {
                                    var rowhd = row[hd];
                                    if (rowhd == undefined) {
                                        rowhd = "";
                                    }

                                    var cellColName = excelheader[table_header.indexOf(hd)];
                                    var cellval =
                                        workbook.Sheets[sheetName][
                                            cellColName + String(roa.indexOf(row) + 2)
                                        ];
                                    if (cellval != undefined) {
                                        if (validationDate(cellval["w"])) {
                                            var dateval = ExcelDateToJSDate(cellval["v"]).split(
                                                "T"
                                            )[0];
                                            rowhd = dateval;
                                        }
                                    }
                                    rowdata.push(rowhd);
                                });
                                table_body.push(rowdata);
                            });
                        }
                        // Write the table with the table header and body from the JSON value
                        WriteTable(table_header, table_body);
                        WriteElements(table_header);
                    });
                    $("#createcardsbtn")[0].style.display = "block";
                    $("#verifybtn")[0].style.display = "block";
                };

                reader.onerror = function(ex) {
                    console.log(ex);
                };

                reader.readAsBinaryString(file);
                $("#filename").html(file.name);
            }
        }
    };
};

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object
    var xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}

$("#loadingdiv").hide();
$("#exceluploadbtn").on("click", function() {
    $("#uploadfile").click();
});

// Authentication into trello
var authenticate = function() {
    var authkey = $("#authkey").val();
    var authtoken = $("#authtoken").val();
    var boardurl = $("#boardurl").val();

    if (authkey !== "" && authtoken !== "" && boardurl != "") {
        $.getJSON('/authtrello', {
            authkey: authkey,
            authtoken: authtoken,
            boardurl: boardurl
        }, function(data) {
            if (data.msg == "success") {
                alert("Authenticated!");
                var listselect_sel = $("#listselect");
                listselect_sel.html("");
                var option = document.createElement("option");
                option.value = "";
                option.innerHTML = "Choose...";
                option.setAttribute("selected", "");
                listselect_sel.append(option);
                data.listnames.map(val => {
                    option = document.createElement("option");
                    option.value = val[0];
                    option.innerHTML = val[1];
                    listselect_sel.append(option);
                });
            } else if (data.msg == "failed") {
                alert("Authentication Failed!")
            }
        });
        return false;
    } else {
        alert("Please input the key, token and board Url");
    }
};

var disablingEl = function() {
    // disabling
    $("#authkey")[0].readOnly = true;
    $("#authtoken")[0].readOnly = true;
    $("#boardurl")[0].readOnly = true;
    $("#listselect")[0].disabled = true;
    $("#cardname1")[0].disabled = true;
    $("#cardname2")[0].disabled = true;
    $("#description")[0].disabled = true;
    var chk = $('input[type="checkbox"]');
    chk.map(idx => {
        chk[idx].setAttribute("disabled", "");
    });
}

var verifycolumns = function() {
    var authkey = $("#authkey").val();
    var authtoken = $("#authtoken").val();
    var boardurl = $("#boardurl").val();
    var listid = $("#listselect").val();
    var cardname1 = $("#cardname1").val();
    label_rows = [];
    if (label_columns.length == 1) {
        excelbody.map(val => {
            label_rows.push(val[excelheader.indexOf(label_columns[0])]);
        })
    }
    label_rows = [...new Set(label_rows)]

    if (authkey !== "" && authtoken !== "" && boardurl !== "" && listid != "") {
        if (cardname1 == "") {
            alert("Please select cardname1");
        } else {
            $.getJSON('/verify', {
                authkey: authkey,
                authtoken: authtoken,
                boardurl: boardurl,
                label_rows: String(label_rows),
                customfields_columns: String(customfields_columns)
            }, function(data) {
                if (data.msg == "success") {
                    var labels = data.labels;
                    var customfields = data.customfields;
                    if (labels.length == 0 && customfields.length == 0) {
                        alert("The labels and customfields already exist!\nPlease create the cards");
                        // disabling
                        disablingEl();
                    } else {
                        alert(String(customfields.length) + " customfields do not exist in this board.\nCreate manually.");
                    }
                } else if (data.msg == "failed") {
                    alert("Verification Failed!")
                }
            });
            return false;
        }
    } else {
        alert("Please input the key, token and board Url, select a list");
    }
}

var createCards = function() {
    var authkey = $("#authkey").val();
    var authtoken = $("#authtoken").val();
    var boardurl = $("#boardurl").val();
    var listid = $("#listselect").val();
    var cardname1 = $("#cardname1").val();
    var cardname2 = $("#cardname2").val();
    var description = $("#description").val();
    excelbodystr = '';
    excelbody.map(val => {
        Object.keys(val).forEach(key => {
            var keyval = val[key];
            excelbodystr += keyval + "___";
        })
        excelbodystr += "|||";
    })
    $("#loadingdiv").show();
    $.getJSON('/createcards', {
        authkey: authkey,
        authtoken: authtoken,
        boardurl: boardurl,
        listid: listid,
        labels: String(label_columns),
        customfields: String(customfields_columns),
        cardname1: cardname1,
        cardname2: cardname2,
        description: description,
        excelheader: String(excelheader),
        excelbody: excelbodystr
    }, function(data) {
        $("#loadingdiv").hide();
        alert("The cards have been created successfully!");
        location.reload();
    });
};

document
    .getElementById("uploadfile")
    .addEventListener("change", handleFileSelect, false);

window.setTimeout(function() {
    $(".alert")
        .fadeTo(500, 0)
        .slideUp(500, function() {
            $(this).remove();
        });
}, 3000);