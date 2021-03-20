
function add(connect, comment, candidateId, vacancyId, personId) {
    DropFormsCache('./settings.js');
    var Settings = OpenCodeLib('./settings.js');
    

    var settings = Settings.get();
    var commentType = settings.comment_type_id;

    var d = new Date();

    //var eventDoc = OpenNewDoc('x-app://base2/base2_events.xmd');
    var eventDoc = OpenNewDoc('x-app://cn/cn_calendar_entry.xmd')
    eventDoc.TopElem.is_calendar_entry = true;
    eventDoc.TopElem.type_id = commentType;
    eventDoc.TopElem.date = d;
    eventDoc.TopElem.creation_date = d;
    eventDoc.TopElem.last_mod_date = d;

    var pch = eventDoc.TopElem.participants.AddChild();
    pch.person_id = personId;

    eventDoc.TopElem.candidate_id = candidateId;
    eventDoc.TopElem.vacancy_id = vacancyId;
    eventDoc.TopElem.comment = comment;
    eventDoc.BindToDb();
    eventDoc.Save();

    return getObjectById(connect, eventDoc.DocID, personId);
}

function update(connect, id, data, personId) {
	var eventDoc = ObtainUiDoc(ObjectDocUrl('data', 'event', id));
	for (el in data){
		try {
			ch = eventDoc.TopElem.OptChild(el);
			ch.Value = data[el];
		} catch(e) {}
	}
	UpdateUiDoc(eventDoc);

	return getObjectById(connect, id, personId);
}

function remove(connect, id) {
    DeleteDoc(ObjectDocUrl('data', 'event', id));
}

function getObjectById(connect, id, personId) {
    DropFormsCache('./connection.js');
    var Connection = OpenCodeLib('./connection.js');
    

    personId = personId == undefined ? 0 : personId;

    var ceq = " \n\
        select \n\
            cast(evs.id as varchar(20)) id, \n\
            cast(evs.candidate_id as varchar(20)) candidate_id, \n\
            evs.[type_id], \n\
            ets.name [type_name], \n\
            ets.text_color, \n\
            evs.date, \n\
            evs.end_date, \n\
            evs.occurrence_id, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../name').value('.', 'varchar(50)') occurrence_name, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../state_name').value('.', 'varchar(50)') occurrence_state_name, \n\
            case \n\
                when evs.participants.exist('/participants/participant/person_id[. = " + personId + "]') = 1 then 1  \n\
                else 0 \n\
            end allow_edit, \n\
            evs.comment \n\
        from [events] evs \n\
        left join event_types ets on ets.id = evs.[type_id] \n\
        outer apply ets.occurrences.nodes('/occurrences') as T(p) \n\
        where \n\
            evs.id = " + id + " \n\
    ";

    return  ArrayOptFirstElem(Connection.execute(ceq, connect));
}

function list(connect,  candidateId, vacancyId, personId) {
    DropFormsCache('./connection.js');
    var Connection = OpenCodeLib('./connection.js');
    
    DropFormsCache('./settings.js');
    var Settings = OpenCodeLib('./settings.js');
    

    var settings = Settings.get();
    var commentType = settings.comment_type_id;

    personId = personId == undefined ? 0 : personId;

    var ceq = " \n\
        select \n\
            cast(evs.id as varchar(20)) id, \n\
            cast(evs.candidate_id as varchar(20)) candidate_id, \n\
            evs.[type_id], \n\
            ets.name [type_name], \n\
            ets.text_color, \n\
            evs.date, \n\
            evs.end_date, \n\
            evs.occurrence_id, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../name').value('.', 'varchar(50)') occurrence_name, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../state_name').value('.', 'varchar(50)') occurrence_state_name, \n\
            case \n\
                when evs.participants.exist('/participants/participant/person_id[. = " + personId + "]') = 1 then 1  \n\
                else 0 \n\
            end allow_edit, \n\
            evs.comment \n\
        from [events] evs \n\
        left join event_types ets on ets.id = evs.[type_id] \n\
        outer apply ets.occurrences.nodes('/occurrences') as T(p) \n\
        where \n\
            evs.vacancy_id = " + vacancyId + " \n\
            and evs.candidate_id = " + candidateId + " \n\
            and evs.[type_id] = '" + commentType + "' \n\
        order by evs.date desc \n\
    ";
    //alert(ceq);

    return Connection.execute(ceq, connect);
}