function isOpen(connection) {
	return (connection != undefined && connection != null) && connection.state != null && connection.state == 1;
}

function close(_connection, rs) {
	if (isOpen(_connection)) {
		if (rs != null && rs != undefined && rs.state == 1) {
			rs.Close();
			rs = undefined;
		}

		_connection.Close();
		_connection = undefined;
	}
}

function open() {
	var newConnect = new ActiveXObject('ADODB.Connection');
	newConnect.Open('Driver={SQL Server};Server=ESTAFF;Database=estaff;Uid=sa;password=Qaz12345');
	return newConnect;
}

function fetchData(recordSet) {
	var arrResult = Array();
	
	if(!recordSet.EOF) {
		recordSet.MoveFirst();
		while (!recordSet.EOF) {
			newObj = new Object();
			for (i=0; i < recordSet.Fields.Count; i++) {
				newObj.SetProperty(StrLowerCase(recordSet.Fields.Item(i).Name), recordSet.Fields.Item(i).Value);
			}
			arrResult.push(newObj);
			recordSet.MoveNext();
		}
	}
	return arrResult;
}

function execute(query, _connection) {
	var conn;
	var recordSet;

	try {
		conn = open();
		recordSet = conn.Execute(query);
		var resultData = fetchData(recordSet);

		close(conn, recordSet);
	} catch(e) {
		close(conn, recordSet);
		throw e;
	}

	return resultData;

	/*var recordSet = null;

    try {
        if (isOpen(_connection)) {
			recordSet = _connection.Execute(query);
			var resultData = fetchData(recordSet);

			recordSet.Close();
			recordSet = undefined;
			return resultData;
		}

		return [];
    } catch(e) {
        close(_connection, recordSet);
        throw e;
    }*/
}
