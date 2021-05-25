from flask import Flask, g, redirect, url_for, request, render_template, jsonify
from flask_oidc import OpenIDConnect
import json
import requests
from datetime import datetime
from urllib.request import urlopen, Request
import math
import os
import re
from requests_oauthlib import OAuth1Session

def _force_https(wsgi_app):
    def wrapper(environ, start_response):
        environ['wsgi.url_scheme'] = 'https'
        return wsgi_app(environ, start_response)

    return wrapper

app = Flask(__name__)

# Load system variables; manipulate wsgi session key
with open('artifact/w3id_sso.json') as f:
    w3id_sso_json = json.load(f)

w3id_sso_json["web"]["client_id"] = os.environ.get("OIDC_CLIENTID")
w3id_sso_json["web"]["client_secret"] = os.environ.get("OIDC_CLIENTSECRET")
OIDC_SECRETKEY = os.environ.get("OIDC_SECRETKEY")
OIDC_SECRETKEY_VAL = str(OIDC_SECRETKEY).encode('ISO-8859-1').decode('unicode-escape')
#print(json.dumps(w3id_sso_json, indent=4))
with open('temp.json', 'w') as json_file:
    json.dump(w3id_sso_json, json_file)

app.wsgi_app = _force_https(app.wsgi_app)
app.config["OIDC_CLIENT_SECRETS"] = "temp.json"
app.config["OIDC_COOKIE_SECURE"] = False
app.config["OIDC_CALLBACK_ROUTE"] = "/oidc/callback"
app.config["SECRET_KEY"] = OIDC_SECRETKEY_VAL
oidc = OpenIDConnect(app)
os.remove("temp.json")
@app.route('/authtrello')
@oidc.require_login
def authtrello():
    authkey = request.args.get('authkey')
    authtoken = request.args.get('authtoken')
    boardurl = request.args.get('boardurl')
    
    # Get list of a board     
    board_id = ""
    listnames = []
    try:
        trello = OAuth1Session(authkey, OIDC_SECRETKEY_VAL, authtoken)
        url = boardurl + ".json"
        boardjson = trello.get(url).json()
        #print(json.dumps(boardjson["lists"], indent=2))
        board_id = boardjson["id"]
       # print("board_id",board_id)
        for i in boardjson["lists"]:
            listnames.append([i["id"], i["name"]])
        
        return jsonify(listnames=listnames, msg="success")

    except Exception as ex:
        print("Please check your network status and try again!")
        return jsonify(listnames=[], msg="failed")

@app.route('/verify')
@oidc.require_login
def verify():
    authkey = request.args.get('authkey')
    authtoken = request.args.get('authtoken')
    boardurl = request.args.get('boardurl')
    label_rows = request.args.get('label_rows')
    customfields_columns = request.args.get('customfields_columns')
    if label_rows != "":
        label_rows = str(label_rows).split(",")
    else:
        label_rows = []
    if customfields_columns != "":
        customfields_columns = str(customfields_columns).split(",")
    else:
        customfields_columns = []
    
    board_id = ""
    jsonlabels = []
    jsoncustomfields = []
    non_exist_labels = []
    non_exist_customfields = []
    # Get the board json
    try:
        trello = OAuth1Session(authkey, OIDC_SECRETKEY_VAL, authtoken)
        url = boardurl + ".json"
        boardjson = trello.get(url).json()
        board_id = boardjson["id"]
        # board labels
        for i in boardjson["labels"]:
            jsonlabels.append(i["name"])
        # board customFields
        for i in boardjson["customFields"]:
            jsoncustomfields.append(i["name"])
        
        # non-existed labels
        for i in label_rows:
            if jsonlabels.count(i) == 0:
                non_exist_labels.append(i)
        # non-existed customFields
        for i in customfields_columns:
            if jsoncustomfields.count(i) == 0:
                non_exist_customfields.append(i)

        return jsonify(msg="success", labels=non_exist_labels, customfields=non_exist_customfields)
    except Exception as ex:
        return jsonify(msg="failed")
    
@app.route('/createlabelsfields')
@oidc.require_login
def createlabelsfields():
    authkey = request.args.get('authkey')
    authtoken = request.args.get('authtoken')
    boardurl = request.args.get('boardurl')
    listid = request.args.get('listid')
    labels = request.args.get('labels')
    customfields = request.args.get('customfields')
    if labels != "":
        labels = str(labels).split(",")
    else:
        labels = []
    if customfields != "":
        customfields = str(customfields).split(",")
    else:
        customfields = []
        
    board_id = ""
    # Get the board json
    try:
        trello = OAuth1Session(authkey, OIDC_SECRETKEY_VAL, authtoken)
        url = boardurl + ".json"
        boardjson = trello.get(url).json()
        board_id = boardjson["id"]
     #   print(board_id)
        # Create the labels
     #   print("Create the labels")
        url = "https://api.trello.com/1/labels"
        for i in labels:
            query = {
                'key': authkey,
                'token': authtoken,
                'name': str(i),
                #'color': '0',
                'idBoard': board_id
            }
            resp = requests.request("POST",url,params=query)
        #    print(i)
            #print(json.dumps(json.loads(resp.text), indent=2))
        
        # Create the customFields
     #   print("Create the customFields")
        url = "https://api.trello.com/1/customFields"
        headers = {
            "Accept": "application/json"
        }  
               
        for i in customfields:
            query = {
                'key': authkey,
                'token': authtoken,
                'idModel': board_id,
                'modelType': 'board',
                'name': str(i),
                'type': 'text'
            }
            resp = requests.request("POST",url, headers=headers, params=query)
            #print(json.dumps(json.loads(resp.text), indent=2))
    
        return jsonify(msg="success")
    except Exception as ex:
        return jsonify(msg="failed")
 
@app.route('/createcards')
@oidc.require_login
def createcards():
    try:        
        authkey = request.args.get('authkey')
        authtoken = request.args.get('authtoken')
        boardurl = request.args.get('boardurl')
        listid = request.args.get('listid')
        labels = request.args.get('labels')
        customfields = request.args.get('customfields')
        cardname1 = request.args.get('cardname1')
        cardname2 = request.args.get('cardname2')
     #   print("cd1 : ", cardname1)
     #   print("cd2 : ", cardname2)
        description = request.args.get('description')
        excelheader = request.args.get('excelheader')
        excelheader = excelheader.split(",")
        excelbody = request.args.get('excelbody')
        tmparr = excelbody.split("|||")
        tmparr.pop()
        bodyarr = []
        created_card_idArr = []
        for i in tmparr:
            tmp = i.split("___")
            tmp.pop()
            bodyarr.append(tmp)
            
        board_id = ""
        # Get the board json
        trello = OAuth1Session(authkey, OIDC_SECRETKEY_VAL, authtoken)
        url = boardurl + ".json"
        boardjson = trello.get(url).json()
        board_id = boardjson["id"]
        jsonlabels = boardjson["labels"]
        
        #print(excelheader)
        # Get the label rows
        labelrows = []
        if labels != "":
            for i in bodyarr:
                labelrows.append(i[excelheader.index(labels)])
        #print(labelrows)
        
        # Get the customFields
        if customfields != "" :
            customfields = customfields.split(",")
        else:
            customfields = []        
        
        # Get the card names
        cardname1arr = []
        cardname2arr = []
        for i in bodyarr:
            #print(excelheader.index(cardname1))
            #print(i)
            cardname1arr.append(i[excelheader.index(cardname1)])
            if cardname2 != "":
                #print(excelheader.index(cardname2))
                cardname2arr.append(i[excelheader.index(cardname2)])
        
      #  print("==cardname12===")
     #   print(cardname1arr)
     #   print(cardname2arr)
        
        # Get the descriptions
        descriptionarr = []
        if description != "":
            for i in bodyarr:
                descriptionarr.append(i[excelheader.index(description)])
        
        # Get the customfields in the boardjson
        jsoncustomfieldids = []
        jsoncustomfieldnames = []
        jsoncustomfieldtype = []
        customfieldsArr = []
        for i in boardjson["customFields"]:
            #print(i["id"],i["name"],i["type"])
            jsoncustomfieldids.append(i["id"])
            jsoncustomfieldnames.append(i["name"])
        for i in customfields:
            if jsoncustomfieldnames.count(i) > 0:
                customfieldsArr.append([jsoncustomfieldids[jsoncustomfieldnames.index(i)], i])
        
        # Get the jsonlabel ids and names
        jsonlabelids = []
        jsonlabelnames = []
        for i in jsonlabels:
            jsonlabelids.append(i["id"])
            jsonlabelnames.append(i["name"])
        
        # Create the cards
        url_cards = "https://api.trello.com/1/cards/"
        if labelrows != []:
            cardidx=0
            for i in labelrows:
                idx = jsonlabelnames.index(i)
                # Create the card
                if cardname2arr != []:
                    cardname = cardname1arr[cardidx] + " - " + cardname2arr[cardidx]
                else:
                    cardname = cardname1arr[cardidx]
               # print("cardname : ", cardname)    
                query_create_card = {
                    'key': authkey,
                    'token': authtoken,
                    'idList': listid,
                    'name': cardname,
                    'idLabels': jsonlabelids[idx]
                }
                response_create_card = requests.request("POST",url_cards,params=query_create_card)
                #print(response_create_card.text)
                created_card_idArr.append(json.loads(response_create_card.text)["id"]) 
                cardidx += 1
        else:
            cardidx = 0
            for i in cardname1arr:
                # Create the card
                if cardname2arr != []:
                    cardname = i + " - " + cardname2arr[cardidx]
                else:
                    cardname = i
             #   print("cardname : ", cardname)    
                query_create_card = {
                    'key': authkey,
                    'token': authtoken,
                    'idList': listid,
                    'name': cardname
                }
                response_create_card = requests.request("POST",url_cards,params=query_create_card)
                #print(response_create_card.text)
                created_card_idArr.append(json.loads(response_create_card.text)["id"])
                cardidx += 1
        
        # Update the created cards
        headers_customfield = {
            "Accept": "application/json"
        }        
        for i in created_card_idArr:
            # ler cada customfield
            for j in customfieldsArr:
                #print("print j",j)
                id_customfield = j[0]
                name_customfield = j[1]
                fieldvalue = bodyarr[created_card_idArr.index(i)][excelheader.index(name_customfield)]
                cf = boardjson["customFields"]
                for opt in cf:
                    #print("opt",opt)
                    if "list" in opt["type"]:
                        #print("type",opt["type"])
                        #print(opt["id"],opt["name"],opt["type"])
                        typeid = opt["id"]
                        keys = {
                            'key': authkey,
                            'token': authtoken
                            }  
                        headers2 = {
                            "Accept": "application/json"
                            }
                        url2 = "https://api.trello.com/1/customFields/"+ typeid + "/options/"
                        #print(url2)
                        response2 = requests.request("GET", url2, headers=headers2, params=keys)
                        #print(response.text)
                        resjson2 = json.loads(response2.content)
                        #print(resjson2)
                        for m in resjson2:
                            _idopt = m["_id"]
                       #     print("_id", _idopt)
                            if fieldvalue in m["value"]["text"]:
                                body = {"idValue": _idopt}
                               # print("for do drop",body)
                                # Update a card
                                keys = {
                                    'key': authkey,
                                    'token': authtoken
                                }            
                                url_add_customfield = url_cards + i + "/customField/" + typeid + "/item"
                              #  print(url_add_customfield)
                                resp = requests.request("PUT", url_add_customfield, headers=headers_customfield, json=body, params=keys)
                # int
                if fieldvalue.isnumeric() == True:
                    body = {"value": {"number": str(fieldvalue)}}
                else:
                    # float
                    if fieldvalue.replace(".", "").isnumeric() == True:
                        if float(fieldvalue) - int(float(fieldvalue)) == 0:
                            body = {"value": {"number": str(int(float(fieldvalue)))}}
                        else:
                            body = {"value": {"number": str(fieldvalue)}}
                    else:
                        if re.match(r'(\d{4})-(\d{1,2})-(\d{1,2})', fieldvalue) != None:
                            body = {"value": {"date": fieldvalue}}
                        else:
                            body = {"value": {"text": fieldvalue}}
                               
                # Update a card
                keys = {
                    'key': authkey,
                    'token': authtoken
                }            
                url_add_customfield = url_cards + i + "/customField/" + id_customfield + "/item"
                resp = requests.request("PUT", url_add_customfield, headers=headers_customfield, json=body, params=keys)
            
            # Update description of a card
            if descriptionarr != []:
                keys = {
                    "key": authkey,
                    "token": authtoken,
                    "desc": bodyarr[created_card_idArr.index(i)][excelheader.index(description)]
                }    
                resp = requests.request("PUT", url_cards + i, params=keys)
        
        return jsonify(msg="success")
    except:
        return jsonify(msg="falied")
    
@app.route('/',methods = ['POST', 'GET'])
@oidc.require_login
def trelloAPI():
    firstname = g.oidc_id_token['firstName']
    #bluegroups = g.oidc_id_token['blueGroups']
    email = g.oidc_id_token['email']
    #print(bluegroups)
    return render_template('board.html', email=email)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8080)
