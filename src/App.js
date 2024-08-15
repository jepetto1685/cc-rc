import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";

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
	let myStyle1 = "";
	let myStyle2 = "";
	let myStyle3 = "";
	
	if ((new Date()).sameDay(dateAndTime)) {
		//сегодня
		myStyle2 = " style-blink";
		
		if ((dateAndTime.getHours() === 0) && (dateAndTime.getMinutes() === 0)){
			// событие до конца дня
		} if (dateAndTime < new Date()) {
			// событие уже наступило
			myStyle1 = "style-green";
		} else {
			// событие наступит
		}
		
	} else if (dateAndTime < new Date()) {
		// вчера
		myStyle1 = "style-green";
	} else {
		// завтра
	}
	
	if (dayOfWeek === 'СБ' || dayOfWeek === 'ВС') {
		myStyle3 = "style-gray";
	}

	return myStyle1 + " " + myStyle2 + " " + myStyle3;
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
		<td> &nbsp; { dayOfWeek1 } &nbsp; </td>
		<td> &nbsp; { dateAsString } &nbsp; </td>
		<td> &nbsp; { row.time } &nbsp; </td>
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
  
  const superMaxValue = 5000000000;
  const [number, setNumber] = useState(superMaxValue);
  const [time, setTime] = useState(new Date());
  const [data, setData] = useState(null);
  
  useEffect(() => {
	  
	if ((number > superMaxValue -1) || (number % 120 == 0)) {
		axios
		.get("/cc-rc/rc-config.json")
		.then(res => {
						const myData = res.data;
						if (myData != null) {
							setData( myData );
							setNumber(1);
						}
					 }
		)
		.catch(function (error) {
			console.log(error.toJSON());
		});
	}
	  
    // таймер пересоздаётся каждый раз когда обновляется number
    const id = setInterval(() => { 
									setNumber(number + 1);
									setTime(new Date()); 
								 }, 1000);
    return () => { clearInterval(id); };
  }, [number]);
  
  
  let appClassStyle = "";
  if (valRotate) {
	  appClassStyle = "App-rotate90 ";
  }
  appClassStyle = "App " + appClassStyle;
  
  const currentTimeAsString = time.toLocaleDateString('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});
	
  return (
	<div className={appClassStyle}>
	  <Checkbox value={valRotate} setValue={setValRotate} label={labelRotate + currentTimeAsString + "// " + number}></Checkbox>
      <div className="App-header">
		<TableComponent data={data} />
      </div>
    </div>
  );
}

export default App;
