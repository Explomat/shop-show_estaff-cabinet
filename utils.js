function toJSON(data) {
	return EncodeJson(data);
}

function log(message) {
	EnableLog('estaff-cabinet');
	LogEvent('idestaff-cabinet', message);
}

function setMessage(type, message) {
	return {
		type: type,
		message: String(message)
	}
}

function setSuccess(data) {
	var m = setMessage('success');
	m.data = data;
	return toJSON(m);
}

function setError(message){
	log(message);
	return toJSON(setMessage('error', message));
}

function toBoolean(val) {
	if (val == 'true' || val == true) {
		return true;
	}
	return false;
}

function toJSObject(xmlElem) {
	var returnObj = {};
	for (el in xmlElem){
		try {
			returnObj.SetProperty(el.Name, String(el.Value));
		} catch(e) {}
	}
	return returnObj;
}

function toJSArray(xmlArray) {
	var returnArr = [];

	for (el in xmlArray) {
		returnArr.push(toJSObject(el));
	}

	return returnArr;
}

function getAttachmentMeta(attachmentsStr, attachmentId) {
	try {
		var doc = OpenDocFromStr('<root>' + attachmentsStr + '</root>');
		var el = ArrayOptFind(doc.TopElem.attachments, 'Int(This.id) == ' + OptInt(attachmentId));
		
		if (el != undefined) {
			var child = el.OptChild('text');
			
			if (child != undefined) {
				var id = child.OptAttrValue('EXT-OBJECT-ID', '');
				if (id == null || id == '') {
					return {
						text: String(child),
						EXT_OBJECT_ID: null,
						contentType: String(el.content_type),
						filename: el.OptChild('file_name') == undefined ? 'file.html' : String(el.OptChild('file_name'))
					}
				}

				return {
					text: '',
					EXT_OBJECT_ID: OptInt(id),
					contentType: String(el.content_type),
					filename: el.OptChild('file_name') == undefined ? 'file.html' : String(el.OptChild('file_name'))
				};
			} else if ((child = el.OptChild('data')) != undefined) {
				var id = child.OptAttrValue('EXT-OBJECT-ID', '');
				return id == null ? id : {
					text: '',
					EXT_OBJECT_ID: OptInt(id),
					contentType: String(el.content_type),
					filename: el.OptChild('file_name') == undefined ? 'file.doc' : String(el.OptChild('file_name'))
				};
			}
			
			return null;
		}
	} catch(e) {
		return null;
	}
	return null;
}

function notificate(templateCode, primaryId, secondaryId, text){
	/*var Notifications = OpenCodeLib('x-local://wt/web/vsk/portal/common/aggregateNotifications.js');
	
	var isNotificate = Notifications.notificate('assessment', templateCode, primaryId, text, secondaryId);
	if (isNotificate) {
		log('Отправка уведомления "' + templateCode + '", сотруднику "' + primaryId + '"');
	} else {
		log('Ошибка отправки уведомления "' + templateCode + '", сотруднику "' + primaryId + '"');
	}*/
}