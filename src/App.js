import './App.css';
import { useState, useEffect } from "react";
import axios from "axios";
import Confetti from "react-confetti";

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

const prepareJsonReleaseData = (json) => {
	var result = [];

	if (json === null) {
		return result;
	}

	let json_rc_info = json["rc-info"];
	let previousDate = new Date(json_rc_info[1].date);

	for(let i = 0; i < json_rc_info.length; i++) {
		let obj = json_rc_info[i];

		// если это событийная строка
		if (typeof obj.version === 'undefined') {
			// текущая дата этой событийной строки
			let objDate = new Date(obj.date);

			while (!previousDate.sameDay(objDate)) {
				previousDate.setDate(previousDate.getDate() + 1);
				if (!previousDate.sameDay(objDate)) {
					// Дополнение до последней событийной строки
					result.push({date: previousDate.toISOString().slice(0, 10), time: '', rc: '', type: 'release_event'});
				}
			}
			// Событийная строка
			previousDate = objDate;
			result.push({date: previousDate.toISOString().slice(0, 10), time: obj.time, rc: obj.rc, type: 'release_event'});
		} else {
			result.push({version : obj.version, type: 'release_version'});
		}
	}

	result.push({ type: 'release_empty' });

	let json_future_release_info = json["future-release-info"];
	for(let i = 0; i < json_future_release_info.length; i++) {
		let obj = json_future_release_info[i];

		let a_date = new Date(obj.date);
		let a_version = obj.version;

		result.push({version : a_version, date : a_date.toISOString().slice(0, 10), type: 'release_future'});
	}


	return result;
}

function getRussianMonthByIndex(monthIndex) {
	const months = [
		'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
		'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
	];
	return months[parseInt(monthIndex)];
}

const prepareJsonBirthDayData = (json) => {
	var result = [];

	if (json === null) {
		return result;
	}

	let json_birthday_info = json["birthday-info"];

	for(let i = 0; i < json_birthday_info.length; i++) {
		let obj = json_birthday_info[i];

		let a_birthday = obj.birthday;
		let a_birthday1 = a_birthday.split("-");
		let a_birthday_month = a_birthday1[0];
		let a_birthday_day = a_birthday1[1];
		let a_bithday_date = new Date((new Date()).getFullYear(), a_birthday_month - 1, a_birthday_day);
		let a_name = obj.name;

		// now
		let now1 = new Date();
		let now2 = new Date(); now2.setDate(now1.getDate() - 1);
		let now3 = new Date(); now3.setDate(now1.getDate() - 2);

		// ДР в ближайшие 3 дня
		if (a_bithday_date.sameDay(now1) || a_bithday_date.sameDay(now2) || a_bithday_date.sameDay(now3)) {

			let a_icon = "";
			let a_isToday = false;
			if (a_bithday_date.sameDay(now1)) {
				a_icon = "/cc-rc/cake.png";
				a_isToday = true;
			}

			let a_birthday_text = a_birthday_day + " " + getRussianMonthByIndex(a_birthday_month - 1);

			result.push({birthday: a_birthday_text, name: a_name, icon: a_icon, isToday : a_isToday });
		}
	}
	return result;
}

const prepareJsonHollydayData = (json) => {
	var result = [];

	if (json === null) {
		return result;
	}

	let json_hollyday_info = json["hollyday-info"];

	for(let i = 0; i < json_hollyday_info.length; i++) {
		let obj = json_hollyday_info[i];

		let a_day = obj.day;
		let a_text = obj.name;
		let a_day1 = a_day.split("-");
		let a_day_month = a_day1[0];
		let a_day_day = a_day1[1];
		let a_day_date = new Date((new Date()).getFullYear(), a_day_month - 1, a_day_day);

		// now
		let now1 = new Date();

		// Сегодня-Праздник?
		if (a_day_date.sameDay(now1)) {
			let a_icon = "/cc-rc/" + obj.logo;
			result.push({icon: a_icon, text : a_text});
		}
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
		myStyle3 = "style-dayoff";
	} else {
		myStyle3 = " style-workday";
	}

	return myStyle1 + " " + myStyle2 + " " + myStyle3;
}

const ReleaseVersionRow = ({ row }) => {
	return (
		<tr>
			<td colspan="4" className="style-version"> { row.version } </td>
		</tr>
	);
}

const ReleaseEmptyRow = ({ row }) => {
	return (
		<tr>
			<td colspan="4" className="style-version"> &nbsp; </td>
		</tr>
	);
}

const ReleaseEventRow = ({ row }) => {

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

const ReleaseFutureRow = ({ row }) => {

	const date = new Date(row.date);
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
			<td> &nbsp;  &nbsp; </td>
			<td> { row.version } </td>
		</tr>
	);
}

const ReleaseTableRow = ({ row }) => {

	if (row.type === 'release_version') {
		return <ReleaseVersionRow row={row} />
	}
	if (row.type === 'release_event') {
		return <ReleaseEventRow row={row} />
	}
	if (row.type === 'release_future') {
		return <ReleaseFutureRow row={row} />
	}

	if (row.type === 'release_empty') {
		return <ReleaseEmptyRow row={row} />
	}
}

const TableComponent = ({ data }) => {
	const rows = prepareJsonReleaseData(data);

	return (
		<table>
			<tbody>
			{rows.map((row1, index) => (
				<ReleaseTableRow row={row1} />
			))}
			</tbody>
		</table>
	);
};

const BirthDayRow = ({ row }) => {
	return (
		<tr>
			<td className={row.isToday? 'style-birthday' : '' }> {row.isToday ? <img width="64" height="64" src={ row.icon } alt="cake"></img> : '' } </td>
			<td className={row.isToday? 'style-birthday' : '' }> &nbsp; { row.birthday } &nbsp; </td>
			<td className={row.isToday? 'style-birthday' : '' }> &nbsp; { row.name } &nbsp; </td>
		</tr>
	);
}

const HollydayRow = ({ row }) => {

	return (
		<>
			<tr>
				<td>
					<img src= { row.icon } alt="logo" width="300" height="300" />
				</td>
			</tr>
			<tr>
				<td width="300">
					{row.text}
				</td>
			</tr>
		</>
	);
}

const BirthDayComponent = ({ data }) => {
	const rows = prepareJsonBirthDayData(data);

	return (
		<table>
			<tbody>
			{rows.map((row1, index) => (
				<BirthDayRow row={row1} />
			))}
			</tbody>
		</table>
	);
};

const HollydayComponent = ({ data }) => {
	const rows = prepareJsonHollydayData(data);

	return (
		<table>
			<tbody>
			{rows.map((row1, index) => (
				<HollydayRow row={row1} />
			))}
			</tbody>
		</table>
	);
};

const isConfetti = (data) => {
	const rows = prepareJsonReleaseData(data);
	for(let i = 0; i < rows.length; i++) {
		let row = rows[i];
		if (row.rc?.includes('Внедрение')) {
			let rcDate = new Date(row.date);
			let nowDate = new Date();
			if (rcDate.sameDay(nowDate)){
				if (nowDate.getMinutes() % 2 === 0){
					return true;
				}
			}
		}
	}
	return false;
}

function App() {

	const [valRotate, setValRotate] = useState(false);
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

	const isConfettiSign = isConfetti(data);
	let confettiComponent = "";
	if (isConfettiSign) { confettiComponent = <Confetti />; }

	return (
		<div className={appClassStyle}>
			<Checkbox value={valRotate} setValue={setValRotate} label={labelRotate + "  " + currentTimeAsString + "// " + number}></Checkbox>
			<div className="App-header">
				<table>
					<tbody>
					<tr>
						<td className="style-top"><HollydayComponent data={data} /> <br/> </td>
						<td><div className="App-header"><TableComponent data={data} /></div></td>
						<td className="style-top"><BirthDayComponent data={data} /></td>
					</tr>
					</tbody>
				</table>
			</div>
			{confettiComponent}
		</div>
	);
}

export default App;
