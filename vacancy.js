function getStatistics(connect, id) {
	var Connection = OpenCodeLib('./connection2.js');
	DropFormsCache('./connection2.js');

	var sq = " \n\
		select \n\
			top 1 \n\
			null original_type_id, \n\
			null [type_id], \n\
			null [type_name], \n\
			'Всего кандидатов' custom_type_name, \n\
			null occurrence_id, \n\
			( \n\
				select count(cs.id) \n\
				from candidates cs \n\
				cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
				where \n\
					T.p.query('vacancy_id').value('.', 'bigint') = " + id + " \n\
			) candidates_count -- Всего кандидатов \n\
		from [events] evs \n\
		\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected' [type_id], \n\
			ets.name [type_name], \n\
			'Тел.интервью' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'phone_interview' \n\
			) candidates_count -- Тел.интервью \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'phone_interview' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected' [type_id], \n\
			ets.name [type_name], \n\
			'Приглашено к рекрутеру' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'interview' \n\
			) candidates_count -- Приглашено к рекрутеру \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'interview' \n\
		\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id], \n\
			ets.name [type_name], \n\
			'Пришло' custom_type_name, \n\
			'' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'interview' \n\
					and evs.occurrence_id = '' \n\
			) candidates_count -- Пришло  \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'interview' \n\
			and evs.occurrence_id = '' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected' [type_id], \n\
			ets.name [type_name], \n\
			'Приглашено к заказчику' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'rr_interview' \n\
			) candidates_count -- Приглашено к заказчику \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'rr_interview' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':' + evs.occurrence_id [type_id], \n\
			ets.name [type_name], \n\
			'Одобрено заказчиком' custom_type_name, \n\
			evs.occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'rr_interview' \n\
					and evs.occurrence_id = 'succeeded' \n\
			) candidates_count -- Одобрено заказчиком \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'rr_interview' \n\
			and evs.occurrence_id = 'succeeded' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected', \n\
			ets.name [type_name], \n\
			'Тестовый день/задание' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'event_type_1' \n\
			) candidates_count -- Тестовый день/задание \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'event_type_1' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected', \n\
			ets.name [type_name], \n\
			'Направлено на СБ' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'event_type_13' \n\
			) candidates_count -- Направлено на СБ \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'event_type_13' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':' + evs.occurrence_id [type_id], \n\
			ets.name [type_name], \n\
			'Прошли СБ' custom_type_name, \n\
			evs.occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'event_type_13' \n\
					and evs.occurrence_id = 'succeeded' \n\
			) candidates_count -- Прошли СБ \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'event_type_13' \n\
			and evs.occurrence_id = 'succeeded' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected', \n\
			ets.name [type_name], \n\
			'Сделан оффер' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'job_offer' \n\
			) candidates_count  -- Сделан оффер \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'job_offer' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':' + evs.occurrence_id [type_id], \n\
			ets.name [type_name], \n\
			'Принят оффер' custom_type_name, \n\
			evs.occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'job_offer' \n\
					and evs.occurrence_id = 'succeeded' \n\
			) candidates_count  -- Принят оффер \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'job_offer' \n\
			and evs.occurrence_id = 'succeeded' \n\
			\n\
		union \n\
		\n\
		select \n\
			top 1 \n\
			evs.[type_id] original_type_id, \n\
			evs.[type_id] + ':custom_not_selected', \n\
			ets.name [type_name], \n\
			'Оформление Офис' custom_type_name, \n\
			'custom_not_selected' occurrence_id, \n\
			( \n\
				select count(distinct(evs.candidate_id)) \n\
				from [events] evs \n\
				where \n\
					evs.vacancy_id = " + id + " \n\
					and evs.[type_id] = 'event_type_17' \n\
			) candidates_count  -- Оформление Офис \n\
		from [events] evs \n\
		left join event_types ets on ets.id = evs.[type_id] \n\
		where \n\
			evs.[type_id] = 'event_type_17' \n\
	";

	return Connection.execute(sq, connect);
}

function getStates(connect) {
	var Connection = OpenCodeLib('./connection2.js');
	DropFormsCache('./connection2.js');

	var sq = " \n\
		select \n\
			vss.id, \n\
			vss.name, \n\
			vss.is_active, \n\
			vss.text_color \n\
		from vacancy_states vss";
	
	return Connection.execute(sq, connect);
}

function getById(connect, id) {
	var Connection = OpenCodeLib('./connection2.js');
	DropFormsCache('./connection2.js');

	var Candidate = OpenCodeLib('./candidate2.js');
	DropFormsCache('./candidate2.js');

	var Utils = OpenCodeLib('./utils.js');
	DropFormsCache('./utils.js');

	var vq = "\n\
		select \n\
			cast(vs.id as varchar(20)) id, \n\
			vs.name, \n\
			cast(vs.position_id as varchar(20)) position_id, \n\
			vs.position_type_id, \n\
			vs.code, \n\
			vs.eid, \n\
			cast(vs.division_id as varchar(20)) division_id, \n\
			cast(vs.org_id as varchar(20)) org_id, \n\
			vs.start_date, \n\
			cast(vs.reason_id as varchar(20)) reason_id, \n\
			vs.salary, \n\
			vs.min_salary, \n\
			vs.max_salary, \n\
			vs.work_start_date, \n\
			vs.job_offer_date, \n\
			vs.work_end_date, \n\
			vs.close_date, \n\
			vs.attachments, \n\
			vs.state_id, \n\
			vss.name state_name, \n\
			vs.state_date, \n\
			vs.recruit_phase_id, \n\
			vrps.name recruit_phase_name, -- последнеее действие рекрутера \n\
			cast(vs.final_candidate_id as varchar(20)) final_candidate_id, \n\
			cts.fullname final_candidate_fullname, \n\
			vs.final_candidate_state_id, \n\
			cst.name final_candidate_state_name, \n\
			vs.suspended_days_num, \n\
			vs.suspended_wdays_num, \n\
			vs.work_days_num, \n\
			vs.req_quantity, --количество открытых позиций \n\
			vs.multi_final_candidate_id, \n\
			vs.end_date, \n\
			vs.comment, \n\
			vs.records, \n\
			cast(vs.user_id as varchar(20)) user_id, \n\
			cast(vs.group_id as varchar(20)) group_id, \n\
			vs.creation_date, \n\
			vs.last_mod_date, \n\
			vs.is_active, \n\
			vs.rr_persons_desc, \n\
			vs.rr_persons_phone_desc, \n\
			vs.priority_id, \n\
			vps.name priority_name, \n\
			vs.req_close_date, \n\
			( \n\
				select count(cs.id) \n\
				from candidates cs \n\
				cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
				where \n\
					T.p.query('vacancy_id').value('.', 'bigint') = vs.id \n\
					--cs.spots.exist('/spots/spot/vacancy_id[. = sql:column(\"vs.id\")]') = 1 \n\
					--cs.main_vacancy_id = vs.id \n\
			) candidates_count \n\
		from vacancies vs \n\
		left join vacancy_states vss on vss.id = vs.state_id \n\
		left join candidates cts on cts.id = vs.final_candidate_id \n\
		left join candidate_states cst on cst.id = vs.final_candidate_state_id \n\
		left join vacancy_recruit_phases vrps on vrps.id = vs.recruit_phase_id \n\
		left join vacancy_priorities vps on vps.id = vs.priority_id \n\
		where vs.id = " + id;

	//alert(vq);

	var result = Connection.execute(vq, connect);
	var elem = ArrayOptFirstElem(result);

	if (elem != undefined) {
		try {
			if (elem.records != '') {
				elem.records = Utils.toJSArray(OpenDocFromStr(elem.records).TopElem);
			}
		} catch(e) { elem.records = []; }
		
		elem.multi_final_candidates = [];
		if (elem.multi_final_candidate_id != '') {
			var fcdoc = OpenDocFromStr('<multi_final_candidates>' + elem.multi_final_candidate_id + '</multi_final_candidates>');
			var arr = [];

			for (el in fcdoc.TopElem) {
				arr.push(OptInt(el));
			}

			elem.multi_final_candidates = Candidate.getFinalCandidates(connect, id, arr);
		}

		elem.statistics = getStatistics(connect, id);

		try {
			if (elem.attachments != '') {
				elem.attachments = Utils.toJSArray(OpenDocFromStr(elem.attachments).TopElem);
				for (el in elem.attachments) {
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
		} catch(e) { elem.attachments = []; }
	}

	return elem;
}

function list(
	connect,
	personId,
	search,
	stateId,
	minRow,
	maxRow,
	pageSize,
	sort,
	sortDirection
) {
	var Connection = OpenCodeLib('./connection2.js');
	DropFormsCache('./connection2.js');

	var vlq = " \n\
		SET NOCOUNT ON; \n\
		declare @person_id bigint = " + (personId == null ? 0 : personId) + "; \n\
		declare @s nvarchar(200) = '" + (search == null ? '' : search) + "'; \n\
		declare @state_id nvarchar(200) = '" + (stateId == null ? '' : stateId) + "'; \n\
		\n\
		select d.* \n\
		from ( \n\
			select \n\
				c.*, \n\
				row_number() over (order by c." + sort + " " + sortDirection + ") as [row_number] \n\
			from ( \n\
				select \n\
					count(vs.id) over() total, \n\
					cast(vs.id as varchar(20)) id, \n\
					vs.name, \n\
					cast(vs.position_id as varchar(20)) position_id, \n\
					vs.position_type_id, \n\
					vs.code, \n\
					vs.eid, \n\
					cast(vs.division_id as varchar(20)) division_id, \n\
					cast(vs.org_id as varchar(20)) org_id, \n\
					vs.start_date, \n\
					cast(vs.reason_id as varchar(20)) reason_id, \n\
					vs.salary, \n\
					vs.min_salary, \n\
					vs.max_salary, \n\
					vs.work_start_date, \n\
					vs.job_offer_date, \n\
					vs.work_end_date, \n\
					vs.close_date, \n\
					vs.state_id, \n\
					vss.name state_name, \n\
					vs.state_date, \n\
					vs.recruit_phase_id, \n\
					vrps.name recruit_phase_name, -- последнеее действие рекрутера \n\
					cast(vs.final_candidate_id as varchar(20)) final_candidate_id, \n\
					cts.fullname final_candidate_fullname, \n\
					vs.final_candidate_state_id, \n\
					cst.name final_candidate_state_name, \n\
					vs.suspended_days_num, \n\
					vs.suspended_wdays_num, \n\
					vs.work_days_num, \n\
					vs.req_quantity, --количество открытых позиций \n\
					--vs.multi_final_candidate_id, \n\
					vs.end_date, \n\
					vs.comment, \n\
					cast(vs.user_id as varchar(20)) user_id, \n\
					cast(vs.group_id as varchar(20)) group_id, \n\
					vs.creation_date, \n\
					vs.last_mod_date, \n\
					vs.is_active, \n\
					vs.rr_persons_desc, \n\
					vs.rr_persons_phone_desc, \n\
					vs.priority_id, \n\
					vps.name priority_name, \n\
					vs.req_close_date, \n\
					( \n\
						select count(cs.id) \n\
						from candidates cs \n\
						cross apply cs.spots.nodes('/spots/spot') as T(p) \n\
						where \n\
							T.p.query('vacancy_id').value('.', 'bigint') = vs.id \n\
							--cs.spots.exist('/spots/spot/vacancy_id[. = sql:column(\"vs.id\")]') = 1 \n\
							--cs.main_vacancy_id = vs.id \n\
					) candidates_count \n\
				from vacancies vs \n\
				left join vacancy_states vss on vss.id = vs.state_id \n\
				cross apply vs.rr_persons.nodes('/rr_persons/rr_person') as T(p) \n\
				left join persons ps on ps.id = T.p.query('person_id').value('.', 'bigint') \n\
				left join candidates cts on cts.id = vs.final_candidate_id \n\
				left join candidate_states cst on cst.id = vs.final_candidate_state_id \n\
				left join vacancy_recruit_phases vrps on vrps.id = vs.recruit_phase_id \n\
				left join vacancy_priorities vps on vps.id = vs.priority_id \n\
				where \n\
					vs.name like '%'+@s+'%' \n\
					and (vs.state_id = @state_id or @state_id = '') \n\
					and (try_convert(bigint, try_convert(varbinary, ps.eid, 1)) = @person_id or @person_id = 0) \n\
			) c \n\
		) d \n\
		where \n\
			d.[row_number] > " + minRow + " and d.[row_number] <= " + maxRow + " \n\
		order by d." + sort + " " + sortDirection
	
	//alert(vlq);
	var result = Connection.execute(vlq, connect);

	for (r in result) {
		esq = "\n\
			select \n\
				top 1 \n\
				ets.name event_name, \n\
				evs.date event_date, \n\
				evs.comment event_comment, \n\
				cs.fullname candidate_fullname \n\
			from [events] evs \n\
			inner join event_types ets on ets.id = evs.[type_id] \n\
			inner join candidates cs on cs.id = evs.candidate_id \n\
			where vacancy_id = " + r.id + " \n\
			order by evs.date desc \n\
		";

		esResult = ArrayOptFirstElem(Connection.execute(esq, connect));
		r.last_event = null;

		if (esResult != undefined) {
			r.last_event = {
				event_name: String(esResult.event_name),
				event_date: Date(esResult.event_date),
				event_comment: String(esResult.event_comment),
				event_candidate_fullname: String(esResult.candidate_fullname)
			}
		}
	}

	var total = 0;
	var fobj = ArrayOptFirstElem(result);
	if (fobj != undefined) {
		total = fobj.total;
	}

	// получаем последнее событие


	var obj = {
		meta: {
			total: Int(total),
			pageSize: pageSize,
			states: getStates(connect)
		},
		list: result
	}
	return obj;
}

function getAttachment(connect, id, attachmentId) {
	var Connection = OpenCodeLib('./connection2.js');
	DropFormsCache('./connection2.js');

	var Utils = OpenCodeLib('./utils.js');
	DropFormsCache('./utils.js');

	var vacancyQuery = " \n\
		select vs.attachments \n\
		from vacancies vs \n\
		where vs.id = " + id;
	
	var vacancyData = ArrayOptFirstElem(Connection.execute(vacancyQuery, connect));
	if (vacancyData != undefined) {
		var attachment = Utils.getAttachmentMeta(vacancyData.attachments, attachmentId);
		
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