import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";

/*
const jsonData = [
  { version: '24.071.00' },
  { date: '2024-08-12', time: '10:00', rc: '24.071.00-rc1-вывыывыв' },
  { date: '2024-08-13', time: '01:00', rc: '24.071.00-rc1' },
  { date: '2024-08-16', time: '23:07', rc: '24.071.00-rc2' },
  { date: '2024-08-16', time: '23:08', rc: '24.071.00-rc2' },
  { date: '2024-08-17', time: '23:09', rc: '24.071.00-rc2' },
  { date: '2024-08-18', time: '07:31', rc: '24.071.00-rc3' },
  { date: '2024-08-19', time: '10:00', rc: '24.071.00-rc4' },
  { version: '24.080.00' },
  { date: '2024-08-20', time: '10:00', rc: '24.080.00-rc1' },
  { date: '2024-08-27', time: '10:00', rc: '24.080.00-rc2' },
  { date: '2024-08-28', time: '10:00', rc: '24.080.00-rc3' },
  { date: '2024-08-29', time: '18:00', rc: 'Стори привязаны, Релиз передвинут 1' },
  { date: '2024-08-30', time: '10:00', rc: '24.080.00-rc4' }
];*/

const Checkbox = (props) => {
  return (
    <label className="checkbox">
      <input
        type="checkbox"
        name={props.name}
        checked={props.value}
        onChange={() => {
          props.setValue(!props.value);
        }}
      />
      {props.label}
    </label>
  );
};

Date.prototype.sameDay = function(d) {
  return this.getFullYear() === d.getFullYear()
    && this.getDate() === d.getDate()
    && this.getMonth() === d.getMonth();
}

const prepareJsonData = (json) => {
	var result = [];
	
	if (json === null) {
		return result;
	}
	
	let previousDate = new Date(json[1].date);
	
	for(let i = 0; i < json.length; i++) {
		let obj = json[i];
		
		// если это событийная строка
		if (typeof obj.version === 'undefined') {
			// текущая дата этой событийной строки
			let objDate = new Date(obj.date);
			
			while (!previousDate.sameDay(objDate)) {
				previousDate.setDate(previousDate.getDate() + 1);
				if (!previousDate.sameDay(objDate)) {
					result.push({date: previousDate.toISOString().slice(0, 10), time: '', rc: ''});
				}
			}
			previousDate = objDate;
		}
		
		result.push(obj);
	}
	
	return result;
}

const dayOfWeek = (dayInDig) => {
    if(dayInDig === 1){
      return "ПН";
    }
    else if(dayInDig === 2){
      return "ВТ";
    }
    else if(dayInDig === 3){
      return "СР";
    }
    else if(dayInDig === 4){
      return "ЧТ";
    }
    else if(dayInDig === 5){
      return "ПТ";
    }
    else if(dayInDig === 6){
      return "СБ";
    }
    else{
      return "ВС";
    }
  }
  
const styleGreen = (dateAndTime, dayOfWeek) => {
	let addStyle = "";
	if ((new Date()).sameDay(dateAndTime)) {
		addStyle = " style-blink";
	}
	if (dateAndTime < new Date()) {
		if ((dateAndTime.getHours() === 0) && (dateAndTime.getMinutes() === 0)){
			return "" + addStyle;
		} else {
			return "style-green" + addStyle;
		}
	}else if (dayOfWeek === 'СБ' || dayOfWeek === 'ВС') {
		return "style-gray" + addStyle;
	} else {
		return "" + addStyle;
	}
}

const VersionRow = ({ row }) => {
	return (
	<tr>
		<td colspan="4" className="style-version"> { row.version } </td>
	</tr>
	);
}

const EventRow = ({ row }) => {
	
	const date = new Date(row.date + " " + row.time);
	const dayOfWeek1 = dayOfWeek(date.getDay());
	const style = styleGreen(date, dayOfWeek1);
	
	const dateAsString = date.toLocaleDateString('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

	return (
	<tr className= { style }>
		<td> { dayOfWeek1 } </td>
		<td> { dateAsString } </td>
		<td> { row.time } </td>
		<td> { row.rc } </td>
	</tr>
	);
}

const TableRow = ({ row }) => {
	const rowType = typeof row.version !== 'undefined';
	
	if (rowType) {
		return <VersionRow row={row} />
	} else {
		return <EventRow row={row} />
	};
}

const TableComponent = ({ data }) => {
  const rows = prepareJsonData(data);

  return (
    <table>
      <tbody>
        {rows.map((row1, index) => (
          <TableRow row={row1} />
        ))}
      </tbody>
    </table>
  );
};

function App() {
	
  const [valRotate, setValRotate] = useState(true); 
  const labelRotate = "Rotate" 
	
  const [time, setTime] = useState(new Date());
  
  const [data, setData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000);
	
	axios.get("/cc-rc/rc-config.json")
      .then(res => {
        const myData = res.data;
        setData( myData );
      });

    return () => clearInterval(interval);
  }, []);
  
  let appClassStyle = "";
  if (valRotate) {
	  appClassStyle = "App-rotate90 ";
  }
  appClassStyle = "App " + appClassStyle;
  
	
  return (
	<div className={appClassStyle}>
	
	<Checkbox value={valRotate} setValue={setValRotate} label={labelRotate}></Checkbox>
	
      <div className="App-header">
		<TableComponent data={data} />
      </div>
    </div>
  );
}

export default App;
