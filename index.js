<%

var Vacancy = OpenCodeLib('x-local://spxml_web/portal/estaff-cabinet_test/vacancy.js');
DropFormsCache('x-local://spxml_web/portal/estaff-cabinet_test/vacancy.js');

var Utils = OpenCodeLib('x-local://spxml_web/portal/estaff-cabinet_test/utils.js');
DropFormsCache('x-local://spxml_web/portal/estaff-cabinet_test/utils.js');

var Candidate = OpenCodeLib('x-local://spxml_web/portal/estaff-cabinet_test/candidate2.js');
DropFormsCache('x-local://spxml_web/portal/estaff-cabinet_test/candidate2.js');

var Connection = OpenCodeLib('x-local://spxml_web/portal/estaff-cabinet_test/connection2.js');
DropFormsCache('x-local://spxml_web/portal/estaff-cabinet_test/connection2.js');

Session.adoConnection4 = null;
/*try {
	if (!Session.HasProperty('adoConnection4') || !Connection.isOpen(Session.adoConnection4)) {
		Session.adoConnection4 = Connection.open();
	}
} catch(e) {
	return Utils.setError(e);
}*/

function get_Vacancies(queryObjects) {
	var personId = queryObjects.GetOptProperty('person_id');
	var vacancyId = queryObjects.GetOptProperty('vacancy_id');

	if (vacancyId != undefined) {
		var vac = Vacancy.getById(Session.adoConnection4, vacancyId);
		return Utils.setSuccess(vac);
	}

	if (personId == undefined) {
		return Utils.setError('Не указан пользователь');
	}

	var search = queryObjects.HasProperty('search') ? DecodeCharset(queryObjects.search, 'utf-8') : '';
	var stateId = queryObjects.HasProperty('state_id') ? queryObjects.state_id : '';
	var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
	var sort = queryObjects.HasProperty('sort') ? String(queryObjects.sort) : 'start_date';
	var sortDirection = queryObjects.HasProperty('sort_direction') ? String(queryObjects.sort_direction) : 'desc';
	var pageSize = 6;

	var min = (page - 1) * pageSize;
	var max = min + pageSize;

	var vlist = Vacancy.list(
		Session.adoConnection4,
		personId,
		search,
		stateId,
		min,
		max,
		pageSize,
		sort,
		sortDirection
	);
	
	return Utils.setSuccess(vlist);
}

function get_Candidates(queryObjects) {
	var vacancyId = queryObjects.GetOptProperty('vacancy_id');
	var candidateId = queryObjects.GetOptProperty('candidate_id');

	if (candidateId != undefined && vacancyId != undefined) {
		var cand = Candidate.getById(Session.adoConnection4, candidateId, vacancyId);
		return Utils.setSuccess(cand);
	}

	if (vacancyId == undefined) {
		return Utils.setError('Не указана вакансия');
	}

	var search = queryObjects.HasProperty('search') ? DecodeCharset(queryObjects.search, 'utf-8') : '';
	var originalTypeId = queryObjects.HasProperty('original_type_id') ? queryObjects.original_type_id : null;
	var occurrenceId = queryObjects.HasProperty('occurrence_id') ? queryObjects.occurrence_id : null;
	occurrenceId = occurrenceId == 'custom_not_selected' ? null : occurrenceId;

	var page = queryObjects.HasProperty('page') ? OptInt(queryObjects.page) : 1;
	var sort = queryObjects.HasProperty('sort') ? String(queryObjects.sort) : 'state_date';
	var sortDirection = queryObjects.HasProperty('sort_direction') ? String(queryObjects.sort_direction) : 'desc';
	var pageSize = 10;

	var min = (page - 1) * pageSize;
	var max = min + pageSize;

	var clist = Candidate.list(
		Session.adoConnection4,
		vacancyId,
		search,
		originalTypeId,
		occurrenceId,
		min,
		max,
		pageSize,
		sort,
		sortDirection
	);

	return Utils.setSuccess(clist);
}

function get_CandidateAttachment(queryObjects) {
	var candidateId = queryObjects.GetOptProperty('candidate_id');
	var attachmentId = queryObjects.GetOptProperty('attachment_id');

	try {
		if (candidateId == undefined || attachmentId == undefined) {
			return Utils.setError('Неверное количество аргументов');
		}

		var attach = Candidate.getAttachment(Session.adoConnection4, candidateId, attachmentId);
		if (attach == null) {
			return Utils.setError('Файл не наден');
		}

		Request.RespContentType = attach.contentType;
		Request.AddRespHeader('Content-Disposition','attachment; filename=' + attach.filename);
		Response.Write(EncodeCharset(attach.data, 'windows-1251'));
		//return attach.data;
	} catch(e) {
		return Utils.setError(e);
	}
}

function get_VacancyAttachment(queryObjects) {
	var vacancyId = queryObjects.GetOptProperty('vacancy_id');
	var attachmentId = queryObjects.GetOptProperty('attachment_id');

	try {
		if (vacancyId == undefined || attachmentId == undefined) {
			return Utils.setError('Неверное количество аргументов');
		}

		var attach = Vacancy.getAttachment(Session.adoConnection4, vacancyId, attachmentId);
		if (attach == null) {
			return Utils.setError('Файл не наден');
		}

		Request.RespContentType = attach.contentType;
		Request.AddRespHeader('Content-Disposition','attachment; filename=' + attach.filename);
		Response.Write(EncodeCharset(attach.data, 'windows-1251'));
		//return attach.data;
	} catch(e){
		return Utils.setError(e);
	}
}

%>