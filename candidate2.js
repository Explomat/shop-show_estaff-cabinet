function _getEvents(connect, candidateId, vacancyId) {
    var Connection = OpenCodeLib('./connection2.js');
    DropFormsCache('./connection2.js');

    var ceq = " \n\
        select \n\
            cast(evs.id as varchar(20)) id, \n\
            cast(evs.candidate_id as varchar(20)) candidate_id, \n\
            evs.[type_id], \n\
            ets.name [type_name], \n\
            evs.date, \n\
            evs.end_date, \n\
            evs.occurrence_id, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../name').value('.', 'varchar(50)') occurrence_name, \n\
            T.p.query('occurrence/id[text() = sql:column(\"evs.occurrence_id\")]/../state_name').value('.', 'varchar(50)') occurrence_state_name \n\
        from [events] evs \n\
        left join event_types ets on ets.id = evs.[type_id] \n\
        cross apply ets.occurrences.nodes('/occurrences') as T(p) \n\
        where \n\
            evs.vacancy_id = " + vacancyId + " \n\
            and evs.candidate_id = " + candidateId + " \n\
        order by evs.date desc \n\
    ";

    return Connection.execute(ceq, connect);
}

function getById(connect, id, vacancyId) {
    var Connection = OpenCodeLib('./connection2.js');
    DropFormsCache('./connection2.js');

    var Utils = OpenCodeLib('./utils.js');
    DropFormsCache('./utils.js');

    var clq = " \n\
        select \n\
            cast(cs.id as varchar(20)) id, \n\
            cs.fullname, \n\
            cs.birth_date, \n\
            cs.age, \n\
            cs.prev_educations, \n\
            cs.mobile_phone, \n\
            cs.email, \n\
            cs.email2, \n\
            cs.skype, \n\
            cs.reg_address, \n\
            cs.comment, \n\
            cs.fullname_en, \n\
            cs.location_id, \n\
            ls.name location_name, \n\
            cs.educ_type_id, --? work_schedule_types \n\
            cs.entrance_type_id, \n\
            cets.name entrance_type_name, \n\
            cs.source_id, \n\
            css.name source_name, \n\
            cs.desired_position_name, \n\
            cs.exp_years, \n\
            cs.salary, \n\
            cs.salary_currency_id, \n\
            ces.name salary_currency_name, \n\
            ces.full_name salary_currency_full_name, \n\
            cs.uni_salary, \n\
            cs.prev_jobs, \n\
            cs.attachments, \n\
            cs.state_id, \n\
            cass.name state_name, \n\
            cs.state_date, \n\
            cs.cp_date, \n\
            cs.is_active, \n\
            cs.max_state_date, \n\
            cs.is_user_duty, \n\
            cs.last_job_org_name, \n\
            cs.last_job_position_name, \n\
            cs.last_comment, \n\
            cast(cs.main_vacancy_id as varchar(20)) main_vacancy_id, \n\
            vs.name main_vacancy_name, \n\
            cs.photo.query('/photo/full_size_url').value('.', 'nvarchar(400)') photo_url --custom \n\
        from candidates cs \n\
        left join locations ls on ls.id = cs.location_id \n\
        left join candidate_entrance_types cets on cets.id = cs.entrance_type_id \n\
        left join candidate_sources css on css.id = cs.source_id \n\
        left join currencies ces on ces.id = cs.salary_currency_id \n\
        left join candidate_states cass on cass.id = cs.state_id \n\
        left join vacancies vs on vs.id = cs.main_vacancy_id \n\
        cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
        where \n\
            cs.id = " + id + " \n\
            and T.p.query('vacancy_id').value('.', 'bigint') = " + vacancyId + " \n\
            --and cs.spots.exist('/spots/spot/vacancy_id[. = " + vacancyId + "]') = 1 \n\
    ";

    var celem = ArrayOptFirstElem(Connection.execute(clq, connect));
    if (celem != undefined) {
		try {
			if (celem.prev_educations != '') {
				celem.prev_educations = Utils.toJSArray(OpenDocFromStr(celem.prev_educations).TopElem);
			}
        } catch(e) { celem.prev_educations = []; }
        
		try {
			if (celem.prev_jobs != '') {
				celem.prev_jobs = Utils.toJSArray(OpenDocFromStr(celem.prev_jobs).TopElem);
			}
        } catch(e) { celem.prev_jobs = []; }
        
        try {
			if (celem.attachments != '') {
				celem.attachments = Utils.toJSArray(OpenDocFromStr(celem.attachments).TopElem);
				for (el in celem.attachments) {
					aq = " \n\
						select name \n\
						from card_attachment_types \n\
						where id = '" + String(el.type_id) + "' \n\
					";

					aResult = ArrayOptFirstElem(Connection.execute(aq, connect));
					if (aResult != undefined) {
						el.type_name = String(aResult.name);
					}
				}
			}
		} catch(e) { celem.attachments = []; }
        
        celem.events = _getEvents(connect, id, vacancyId);

        // получаем вакансии по кандидату
        var vqs = " \n\
            select \n\
                vs.id, \n\
                vs.name, \n\
                vs.start_date \n\
            from ( \n\
                select \n\
                    T.p.query('vacancy_id').value('.', 'bigint') vacancy_id \n\
                from candidates cs \n\
                cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
                where \n\
                    cs.id = " + id + " \n\
                    --and T.p.query('vacancy_id').value('.', 'bigint') <> " + vacancyId + " \n\
            ) d \n\
            inner join vacancies vs on vs.id = d.vacancy_id \n\
        ";

        celem.vacancies = Connection.execute(vqs, connect);
    }

    return celem;
}

function list(
    connect,
    vacancyId,
    search,
    originalTypeId,
    occurrenceId,
    minRow,
    maxRow,
    pageSize,
    sort,
    sortDirection
) {
    var Connection = OpenCodeLib('./connection2.js');
    DropFormsCache('./connection2.js');

    var clq = " \n\
        SET NOCOUNT ON; \n\
        declare @vacancy_id bigint = " + (vacancyId == null ? 0 : vacancyId) + "; \n\
        declare @s nvarchar(200) = '" + (search == null ? '' : search) + "'; \n\
        declare @original_type_id nvarchar(200) = " + (originalTypeId == null ? 'null' : "'" + originalTypeId + "'") + "; \n\
        declare @occurrence_id nvarchar(200) = " + (occurrenceId == null ? 'null' : "'" + occurrenceId + "'") + "; \n\
        \n\
        select d.* \n\
		from ( \n\
            select \n\
                    c.*, \n\
                    row_number() over (order by c." + sort + " " + sortDirection + ") as [row_number] \n\
                from ( \n\
                    select \n\
                        count(cs.id) over() total, \n\
                        cast(cs.id as varchar(20)) id, \n\
                        cs.fullname, \n\
                        cs.birth_date, \n\
                        cs.age, \n\
                        cs.mobile_phone, \n\
                        cs.email, \n\
                        cs.email2, \n\
                        cs.skype, \n\
                        cs.reg_address, \n\
                        cs.comment, \n\
                        cs.fullname_en, \n\
                        cs.location_id, \n\
                        ls.name location_name, \n\
                        cs.educ_type_id, --? work_schedule_types \n\
                        cs.entrance_type_id, \n\
                        cets.name entrance_type_name, \n\
                        cs.source_id, \n\
                        css.name source_name, \n\
                        cs.desired_position_name, \n\
                        cs.exp_years, \n\
                        cs.salary, \n\
                        cs.salary_currency_id, \n\
                        ces.name salary_currency_name, \n\
                        ces.full_name salary_currency_full_name, \n\
                        cs.uni_salary, \n\
                        cs.state_id, \n\
                        cass.name state_name, \n\
                        cs.state_date, \n\
                        cs.cp_date, \n\
                        cs.is_active, \n\
                        cs.max_state_date, \n\
                        cs.is_user_duty, \n\
                        cs.last_job_org_name, \n\
                        cs.last_job_position_name, \n\
                        cs.last_comment, \n\
                        cast(cs.main_vacancy_id as varchar(20)) main_vacancy_id, \n\
                        vs.name main_vacancy_name, \n\
                        cs.photo.query('/photo/full_size_url').value('.', 'nvarchar(400)') photo_url --custom \n\
                    from ( \n\
                        select \n\
                            distinct(evs.candidate_id) \n\
                        from [events] evs \n\
                        --left join candidates cs on cs.id = evs.candidate_id \n\
				        --cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
                        where \n\
                            (evs.vacancy_id = @vacancy_id or @vacancy_id = 0) \n\
                            and (evs.[type_id] = @original_type_id or @original_type_id is null) \n\
                            and (evs.occurrence_id = @occurrence_id or @occurrence_id is null) \n\
                            --and (T.p.query('vacancy_id').value('.', 'bigint') = @vacancy_id or @vacancy_id = 0) \n\
                    ) cs1 \n\
                    inner join candidates cs on cs.id = cs1.candidate_id \n\
                    left join locations ls on ls.id = cs.location_id \n\
                    left join candidate_entrance_types cets on cets.id = cs.entrance_type_id \n\
                    left join candidate_sources css on css.id = cs.source_id \n\
                    left join currencies ces on ces.id = cs.salary_currency_id \n\
                    left join candidate_states cass on cass.id = cs.state_id \n\
                    left join vacancies vs on vs.id = cs.main_vacancy_id \n\
                    where \n\
                        cs.fullname like '%'+@s+'%' \n\
                ) c \n\
            ) d \n\
        where \n\
            d.[row_number] > " + minRow + " and d.[row_number] <= " + maxRow + " \n\
        order by d." + sort + " " + sortDirection;
    
    //alert('clq: ' + clq);
    var result = Connection.execute(clq, connect);

	var total = 0;
	var fobj = ArrayOptFirstElem(result);
	if (fobj != undefined) {
		total = fobj.total;
	}

	var obj = {
		meta: {
			total: Int(total),
			pageSize: pageSize
		},
		list: result
	}
	return obj;
}

function getFinalCandidates(connect, vacancyId, candidateIds) {
    var Connection = OpenCodeLib('./connection2.js');
    DropFormsCache('./connection2.js');

    if (candidateIds.length == 0) {
        return [];
    }

    var cq1 = " \n\
        select \n\
            cast(cs.id as varchar(20)) id, \n\
            cs.fullname, \n\
            cs.state_id, \n\
            css.name state_name, \n\
            cs.last_comment, \n\
            cs.state_date \n\
        from candidates cs \n\
        left join candidate_states css on css.id = cs.state_id \n\
        cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
        where \n\
            cs.id in (" + candidateIds.join(',') + ") \n\
            and T.p.query('vacancy_id').value('.', 'bigint') = " + vacancyId + " \n\
            --and cs.spots.exist('/spots/spot/vacancy_id[. = " + vacancyId + "]') = 1 \n\
    ";

    return Connection.execute(cq1, connect);
}

function getAttachment(connect, id, attachmentId) {
    var Connection = OpenCodeLib('./connection2.js');
    DropFormsCache('./connection2.js');

    var Utils = OpenCodeLib('./utils.js');
    DropFormsCache('./utils.js');

    var candidateQuery = " \n\
		select c.attachments \n\
		from candidates c \n\
		where c.id = " + id;
	
	var candidateData = ArrayOptFirstElem(Connection.execute(candidateQuery, connect));
	if (candidateData != undefined) {
        var attachment = Utils.getAttachmentMeta(candidateData.attachments, attachmentId);
        
		if (attachment != null) {
            if (attachment.text != '') {
				return {
					data: attachment.text,
					contentType: attachment.contentType,
					filename: attachment.filename
				}
			}

			var aquery = "select lf.data from [(spxml_large_fields)] lf where lf.id = " + attachment.EXT_OBJECT_ID;
			var rdata = ArrayOptFirstElem(Connection.execute(aquery, connect));
            
			if (rdata != undefined) {
				return {
					data: rdata.data,
					contentType: attachment.contentType,
					filename: attachment.filename
				}
			}
		}
    }
    
	return null;
}