import React from 'react'
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts'
import './Charts.css'

function Charts(props) {

	/* Set parameter defaults for when no value is inputted. */
	let data = []
	let currYear = (new Date()).getFullYear()
	let totalInterest = 0
	let years = 0
	if(props.years !== ''){
		years = parseInt(props.years)
	}
	let rate = 0
	if(props.rate !== ''){
		rate = parseFloat(props.rate)/100
	}
	let payment = 0
	if(props.payment !== ''){
		payment = parseInt(props.payment.split(",").join(""))
	}
	let amount = 0
	if(props.amount !== ''){
		amount = parseInt(props.amount.split(",").join(""))
	}


	/* Populate data if viewing investment chart. */
	if (props.currentView === 'investment'){
		let contributions = amount
		let total = amount

		data.push({Year: currYear, Total: total, Contributions: contributions, Interest: total - contributions})

		for(let i = 1; i <= years; i++){
			/* Loop over 12 months */
			for(let i = 0; i < 12; i++){
				total = total * (1+rate/12) + payment
				contributions += payment
			}
			let roundedTotal = Math.round(total).toFixed(0)
			data.push({Year: currYear+i, Total: roundedTotal, Contributions: contributions, Interest: roundedTotal - contributions})
		}
	}

	/* Populate data if viewing debt chart. */
	if (props.currentView === 'debt'){
		let total = amount
		let prevTotal = amount
		let principal = amount
		let monthlyRate = rate/12

		data.push({Year: currYear, Total: total, Principal: principal, Interest: total - principal})

		/* Run until debt is paid off, or only for ten years if debt is increasing with given parameters */
		while(total < prevTotal || years <= 10) {
			if(total >= prevTotal && years === 10){
				years = -1
				break
			}

			/* Loop over 12 months */
			prevTotal = total
			for(let i = 0; i < 12 && total > 0; i++){
				totalInterest += (total * (monthlyRate))
				total = total * (1+monthlyRate)
				total -= payment
				principal -= payment
			}
			currYear += 1
			years += 1 /* This counter is used to say how many years it took to pay off debt in the description.*/

			let roundedTotal = Math.round(total).toFixed(0)

			/* Check if the principal gets paid off on next iteration. */
			if(principal < 0){
				/* Check if the total balance is paid off on next iteration. */
				if(total > 0){
					data.push({Year: currYear, Total: roundedTotal, Principal: 0, Interest: roundedTotal})
				}
				else{
					data.push({Year: currYear, Total: 0, Principal: 0, Interest: 0})
					break
				}
			}
			else{
				data.push({Year: currYear, Total: roundedTotal, Principal: principal, Interest: totalInterest})
			}
		}
	}

	/* Customize the barcharts tooltip. */
	let CustomTooltip = ({ active, payload, label }) => {
	  if (active) {
	    return (
			<div className="charts-custom-tooltip">
				<p className="charts-label">{`${label}`}</p>
				<p className="charts-label-total">{`Total : $${parseInt(payload[0].value+payload[1].value).toLocaleString()}`}</p>
				<p className="charts-label-interest">{`${payload[1].name} : $${parseInt(payload[1].value).toLocaleString()}`}</p>
				<p className="charts-label-contributions">{`${payload[0].name} : $${parseInt(payload[0].value).toLocaleString()}`}</p>
			</div>
	    );
	  }
	  return null;
	};
	
	/* The description that will sumarize the chart. */
	let investmentDescription = <p>Your investment will be worth <span className='charts-blue-text'>${parseInt(data[data.length-1].Total).toLocaleString()}</span> in {years} years.</p>
	let debtDescription = /* A layered ternary expression to choose appropriate expression. */
		years === -1 ? 
		<p>Your loan will increase indefinitely. Increase your monthly payment.</p> : 
		years ===  1 ? 
		parseInt(totalInterest) >= 0 ? 
		<p>You will pay off your loan within 1 year, with <span className='charts-red-text'>${parseInt(totalInterest.toFixed(0)).toLocaleString()}</span> paid in interest.</p> :
		<p>You will pay off your loan within 1 year, with no interest paid.</p> : 
		parseInt(totalInterest) >= 0 ? 
		<p>You will pay off your loan in {years} years, with <span className='charts-red-text'>${parseInt(totalInterest.toFixed(0)).toLocaleString()}</span> paid in interest.</p> :
		<p>You will pay off your loan in {years} years, with no interest paid.</p>


	return (
		<div className='charts-container'>
			{props.currentView === 'investment' ? investmentDescription : debtDescription}
			<ResponsiveContainer>
				<BarChart data={data} margin={{top: 10, right: 10, left: 10, bottom: 10,}}>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="Year" />
					<YAxis />
					<Tooltip content={<CustomTooltip />} />
					<Legend />
					<Bar type="monotone"
						  dataKey={props.currentView === 'investment' ? 'Contributions' : 'Principal'}
						  stackId="1"
						  stroke="#82ca9d"
						  fill="#82ca9d"
						  />
					<Bar type="monotone"
						  dataKey="Interest"
						  stackId="1"
						  stroke="#ffc658"
						  fill="#ffc658"
						  />
				</BarChart>
			</ResponsiveContainer>
  		</div>
	);
}

export default Charts;
