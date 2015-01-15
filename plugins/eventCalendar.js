/* =
	jquery.eventCalendar.js
	version: 0.54
	date: 18-04-2013
	author:
		Jaime Fernandez (@vissit)
	company:
		Paradigma Tecnologico (@paradigmate)
*/

;jQuery.fn.eventCalendar = function(options){

	var eventsOpts = jQuery.extend({}, jQuery.fn.eventCalendar.defaults, options);

	// define global vars for the function
	var flags = {
		wrap: "",
		directionLeftMove: "300",
		eventsJson: {}
	}

	// each eventCalendar will execute this function
	this.each(function(){

		flags.wrap = jQuery(this);

		//Quick hack to prevent element stacking. Better to fix this plugin by creating a proper destructable prototype
		if (!flags.wrap.hasClass('eventCalendar-wrap'))
		{
			flags.wrap.addClass('eventCalendar-wrap').append("<div class='eventsCalendar-list-wrap'><p class='eventsCalendar-subtitle'></p><div class='eventsCalendar-list-content'><ul class='eventsCalendar-list'></ul></div></div>");

			if (eventsOpts.eventsScrollable) {
				flags.wrap.find('.eventsCalendar-list-content').addClass('scrollable');
			}

			setCalendarWidth();
			jQuery(window).resize(function(){
				setCalendarWidth();
			});
			//flags.directionLeftMove = flags.wrap.width();

			// show current month
			dateSlider("current");

			getEvents(eventsOpts.eventsLimit,false,false,false,false);

			calendarNavigation();

			flags.wrap.on('click','.eventsCalendar-day a',function(e){
			//flags.wrap.find('.eventsCalendar-day a').live('click',function(e){
				e.preventDefault();
				var year = flags.wrap.attr('data-current-year'),
					month = flags.wrap.attr('data-current-month'),
					day = jQuery(this).parent().attr('rel');

				getEvents(false, year, month,day, "day");
			});
			flags.wrap.on('click','.monthTitle', function(e){
			//flags.wrap.find('.monthTitle').live('click',function(e){
				e.preventDefault();
				var year = flags.wrap.attr('data-current-year'),
					month = flags.wrap.attr('data-current-month');

				getEvents(eventsOpts.eventsLimit, year, month,false, "month");
			})
		}
	});

	// show event description
	flags.wrap.find('.eventsCalendar-list').on('click','.eventTitle',function(e){
	//flags.wrap.find('.eventsCalendar-list .eventTitle').live('click',function(e){
		if(!eventsOpts.showDescription) {
			e.preventDefault();
			var desc = jQuery(this).parent().find('.eventDesc');

			if (!desc.find('a').size()) {
				var eventUrl = jQuery(this).attr('href');
				var eventTarget = jQuery(this).attr('target');

				// create a button to go to event url
				desc.append('<a href="' + eventUrl + '" target="'+eventTarget+'" class="bt">'+eventsOpts.txt_GoToEventUrl+'</a>')
			}

			if (desc.is(':visible')) {
				desc.slideUp();
			} else {
				if(eventsOpts.onlyOneDescription) {
					flags.wrap.find('.eventDesc').slideUp();
				}
				desc.slideDown();
			}

		}
	});

	function sortJson(a, b){
		return a.date.toLowerCase() > b.date.toLowerCase() ? 1 : -1;
	};

	function dateSlider(show, year, month) {
		var jQueryeventsCalendarSlider = jQuery("<div class='eventsCalendar-slider'></div>"),
			jQueryeventsCalendarMonthWrap = jQuery("<div class='eventsCalendar-monthWrap'></div>"),
			jQueryeventsCalendarTitle = jQuery("<div class='eventsCalendar-currentTitle'><a href='#' class='monthTitle'></a></div>"),
			jQueryeventsCalendarArrows = jQuery("<a href='#' class='arrow prev week'><span class='week'>prev week</span></a><a href='#' class='arrow prev month'><span class='month'>" + eventsOpts.txt_prev + "</span></a><a href='#' class='arrow next week'><span class='week'>next week</span></a><a href='#' class='arrow next month'><span class='month'>" + eventsOpts.txt_next + "</span></a>");
			jQueryeventsCalendarDaysList = jQuery("<ul class='eventsCalendar-daysList'></ul>"),
			date = new Date();

		if (!flags.wrap.find('.eventsCalendar-slider').size()) {
			flags.wrap.prepend(jQueryeventsCalendarSlider);
			jQueryeventsCalendarSlider.append(jQueryeventsCalendarMonthWrap);
		} else {
			flags.wrap.find('.eventsCalendar-slider').append(jQueryeventsCalendarMonthWrap);
		}

		flags.wrap.find('.eventsCalendar-monthWrap.currentMonth').removeClass('currentMonth').addClass('oldMonth');
		jQueryeventsCalendarMonthWrap.addClass('currentMonth').append(jQueryeventsCalendarTitle, jQueryeventsCalendarDaysList);

		// if current show current month & day
		if (show === "current") {
			day = date.getDate();
			jQueryeventsCalendarSlider.append(jQueryeventsCalendarArrows);

		} else {
			date = new Date(flags.wrap.attr('data-current-year'),flags.wrap.attr('data-current-month'),1,0,0,0); // current visible month
			day = 0; // not show current day in days list

			moveOfMonth = 1;
			if (show === "prev") {
				moveOfMonth = -1;
			}
			date.setMonth( date.getMonth() + moveOfMonth );

			var tmpDate = new Date();
			if (date.getMonth() === tmpDate.getMonth()) {
				day = tmpDate.getDate();
			}
		}

		// get date portions
		var year = date.getFullYear(), // year of the events
			currentYear = (new Date).getFullYear(), // current year
			month = date.getMonth(), // 0-11
			monthToShow = month + 1;

		if (show != "current") {
			// month change
			getEvents(eventsOpts.eventsLimit, year, month,false, show);
		}

		flags.wrap.attr('data-current-month',month)
			.attr('data-current-year',year);

		// add current date info
		jQueryeventsCalendarTitle.find('.monthTitle').html(eventsOpts.monthNames[month] + " " + year);

		// print all month days
		var daysOnTheMonth = 32 - new Date(year, month, 32).getDate();
		var daysList = [];
		var pageDays = 0;
		if (eventsOpts.showDayAsWeeks) {
			jQueryeventsCalendarDaysList.addClass('showAsWeek');

			// show day name in top of calendar
			if (eventsOpts.showDayNameInCalendar) {
				jQueryeventsCalendarDaysList.addClass('showDayNames');

				var i = 0;
				// if week start on monday
				if (eventsOpts.startWeekOnMonday) {
					i = 1;
				}

				for (; i < 7; i++) {
					daysList.push('<li class="eventsCalendar-day-header">'+eventsOpts.dayNamesShort[i]+'</li>');

					if (i === 6 && eventsOpts.startWeekOnMonday) {
						// print sunday header
						daysList.push('<li class="eventsCalendar-day-header">'+eventsOpts.dayNamesShort[0]+'</li>');
					}

				}
			}

			dt=new Date(year, month, 01);
			var weekDay = dt.getDay(); // day of the week where month starts

			if (eventsOpts.startWeekOnMonday) {
				weekDay = dt.getDay() - 1;
			}
			if (weekDay < 0) { weekDay = 6; } // if -1 is because day starts on sunday(0) and week starts on monday

			//Make sure we have a full extra week to use.
			if (weekDay < 7)
			{
				weekDay = weekDay + 7;
			}

			//Get number of days in the previous month.
			var lastMonth = month - 1;
			var lastYear = year;
			if (lastMonth < 0)
			{
				lastMonth = 11;
				lastYear--;
			}

			var prevMonthDays = 32 - new Date(lastYear, lastMonth, 32).getDate();
			for (i = weekDay; i > 0; i--) {
				pageDays++;
				daysList.push('<li class="eventsCalendar-day empty"><b class="holder">' + (prevMonthDays - i + 1) + '</b></li>');
// 				daysList.push('<li class="eventsCalendar-day empty"><b>&nbsp;</b></li>');
			}
		}

		for (dayCount = 1; dayCount <= daysOnTheMonth; dayCount++) {
			var dayClass = "";

			if (day > 0 && dayCount === day && year === currentYear) {
				dayClass = "today";
			}
			//*!*Need t check if this is the selected week and if so add the clas to the day item.
			daysList.push('<li id="dayList_' + dayCount + '" rel="'+dayCount+'" class="eventsCalendar-day '+dayClass+'"><a href="#">' + dayCount + '</a></li>');
			pageDays++;
		}

		// fill in the blanks
		var remainingDays = 0;
		if (pageDays % 7 > 0)
		{
			remainingDays = 7 - (pageDays % 7);
		}

		//Make sure we have a full extra week to use.
		if (remainingDays < 7)
		{
			remainingDays = remainingDays + 7;
		}

		//Get the remaining days for the next month
		for (var n = 0; n < remainingDays; n++)
		{
			daysList.push('<li class="eventsCalendar-day empty"><b class="holder">' + (n + 1) + '</b></li>');
			//daysList.push('<li class="eventsCalendar-day empty"><b>&nbsp;</b></li>');
		}

		//Hard code the height of the calender.
		var totalDays = pageDays + remainingDays;
		var calendarHeight = 267;
		if (totalDays / 7 == 6)
		{
			calendarHeight = 223;
		}
		else if (totalDays / 7 == 8)
		{
			calendarHeight = 311;
		}

		jQueryeventsCalendarDaysList.append(daysList.join(''));
		jQuery('.eventsCalendar-monthWrap').css('height',calendarHeight+'px');
		jQuery('.eventsCalendar-slider').css('height',calendarHeight+'px');
	}

	function num_abbrev_str(num) {
		var len = num.length, last_char = num.charAt(len - 1), abbrev
		if (len === 2 && num.charAt(0) === '1') {
			abbrev = 'th'
		} else {
			if (last_char === '1') {
				abbrev = 'st'
			} else if (last_char === '2') {
				abbrev = 'nd'
			} else if (last_char === '3') {
				abbrev = 'rd'
			} else {
				abbrev = 'th'
			}
		}
		return num + abbrev
	}

	//This function is being rewritten to get the events from the interface tables.
	//I'll do a call to the framework helper to get the vents for the specified month/week/day.
	//Meanwhile we have created an option to turn off events.
	function getEvents(limit, year, month, day, direction) {

		//Exit if we are not using events.
		if (!eventsOpts.useEvents)
		{
			return;
		}

		var limit = limit || 0;
		var year = year || '';
		var day = day || '';

		// to avoid problem with january (month = 0)
		if (typeof month != 'undefined') {
			var month = month;
		} else {
			var month = '';
		}

		//var month = month || '';
		flags.wrap.find('.eventsCalendar-loading').fadeIn();

		if (eventsOpts.jsonData) {
			// user send a json in the plugin params
			eventsOpts.cacheJson = true;

			flags.eventsJson = eventsOpts.jsonData;
			getEventsData(flags.eventsJson, limit, year, month, day, direction);

		} else if (!eventsOpts.cacheJson || !direction) {
			// first load: load json and save it to future filters
			jQuery.getJSON(eventsOpts.eventsjson + "?limit="+limit+"&year="+year+"&month="+month+"&day="+day, function(data) {
				flags.eventsJson = data; // save data to future filters
				getEventsData(flags.eventsJson, limit, year, month, day, direction);
			}).error(function() {
				//showError("error getting json: ");
			});
		} else {
			// filter previus saved json
			getEventsData(flags.eventsJson, limit, year, month, day, direction);
		}

		if (day > '') {
			flags.wrap.find('.current').removeClass('current');
			flags.wrap.find('#dayList_'+day).addClass('current');
		}
	}

	function getEventsData(data, limit, year, month, day, direction){
		directionLeftMove = "-=" + flags.directionLeftMove;
		eventContentHeight = "auto";

		subtitle = flags.wrap.find('.eventsCalendar-list-wrap .eventsCalendar-subtitle')
		if (!direction) {
			// first load
			subtitle.html(eventsOpts.txt_NextEvents);
			eventContentHeight = "auto";
			directionLeftMove = "-=0";
		} else {
			if (day != '') {
				subtitle.html(eventsOpts.txt_SpecificEvents_prev + eventsOpts.monthNames[month] + " " + num_abbrev_str(day) + " " + eventsOpts.txt_SpecificEvents_after);
			} else {
				subtitle.html(eventsOpts.txt_SpecificEvents_prev + eventsOpts.monthNames[month] + " " + eventsOpts.txt_SpecificEvents_after);
			}

			if (direction === 'prev') {
				directionLeftMove = "+=" + flags.directionLeftMove;
			} else if (direction === 'day' || direction === 'month') {
				directionLeftMove = "+=0";
				eventContentHeight = 0;
			}
		}

		flags.wrap.find('.eventsCalendar-list').animate({
			opacity: eventsOpts.moveOpacity,
			left: directionLeftMove,
			height: eventContentHeight
		}, eventsOpts.moveSpeed, function() {
			flags.wrap.find('.eventsCalendar-list').css({'left':0, 'height': 'auto'}).hide();
			//wrap.find('.eventsCalendar-list li').fadeIn();

			var events = [];

			data = jQuery(data).sort(sortJson); // sort event by dates

			// each event
			if (data.length) {

				// show or hide event description
				var eventDescClass = '';
				if(!eventsOpts.showDescription) {
					eventDescClass = 'hidden';
				}
				var eventLinkTarget = "_self";
				if(eventsOpts.openEventInNewWindow) {
					eventLinkTarget = '_target';
				}

				var i = 0;
				jQuery.each(data, function(key, event) {
					if (eventsOpts.jsonDateFormat == 'human') {
						var eventDateTime = event.date.split(" "),
							eventDate = eventDateTime[0].split("-"),
							eventTime = eventDateTime[1].split(":"),
							eventYear = eventDate[0],
							eventMonth = parseInt(eventDate[1]) - 1,
							eventDay = parseInt(eventDate[2]),
							//eventMonthToShow = eventMonth,
							eventMonthToShow = parseInt(eventMonth) + 1,
							eventHour = eventTime[0],
							eventMinute = eventTime[1],
							eventSeconds = eventTime[2],
							eventDate = new Date(eventYear, eventMonth, eventDay, eventHour, eventMinute, eventSeconds);
					} else {
						var eventDate = new Date(parseInt(event.date)),
							eventYear = eventDate.getFullYear(),
							eventMonth = eventDate.getMonth(),
							eventDay = eventDate.getDate(),
							eventMonthToShow = eventMonth + 1,
							eventHour = eventDate.getHours(),
							eventMinute = eventDate.getMinutes();

					}

					if (parseInt(eventMinute) <= 9) {
						eventMinute = "0" + parseInt(eventMinute);
					}


					if (limit === 0 || limit > i) {
						// if month or day exist then only show matched events

						if ((month === false || month == eventMonth)
								&& (day == '' || day == eventDay)
								&& (year == '' || year == eventYear) // get only events of current year
							) {
								// if initial load then load only future events
								if (month === false && eventDate < new Date()) {

								} else {
									eventStringDate = eventDay + "/" + eventMonthToShow + "/" + eventYear;
									if (event.url) {
										var eventTitle = '<a href="'+event.url+'" target="' + eventLinkTarget + '" class="eventTitle">' + event.title + '</a>';
									} else {
										var eventTitle = '<span class="eventTitle">'+event.title+'</span>';
									}
									events.push('<li id="' + key + '" class="'+event.type+'"><time datetime="'+eventDate+'"><em>' + eventStringDate + '</em><small>'+eventHour+":"+eventMinute+'</small></time>'+eventTitle+'<p class="eventDesc ' + eventDescClass + '">' + event.description + '</p></li>');
									i++;
								}
						}
					}

					// add mark in the dayList to the days with events
					if (eventYear == flags.wrap.attr('data-current-year') && eventMonth == flags.wrap.attr('data-current-month')) {
						flags.wrap.find('.currentMonth .eventsCalendar-daysList #dayList_' + parseInt(eventDay)).addClass('dayWithEvents');
					}

				});
			}
			// there is no events on this period
			if (!events.length) {
				events.push('<li class="eventsCalendar-noEvents"><p>' + eventsOpts.txt_noEvents + '</p></li>');
			}
			flags.wrap.find('.eventsCalendar-loading').hide();

			flags.wrap.find('.eventsCalendar-list')
				.html(events.join(''));

			flags.wrap.find('.eventsCalendar-list').animate({
				opacity: 1,
				height: "toggle"
			}, eventsOpts.moveSpeed);

		});
		setCalendarWidth();
	}

	function calendarNavigation() {
		flags.wrap.find('.arrow').click(function(e){
			e.preventDefault();

			var textSpan = jQuery(this).find('span').eq(0);
 			if (textSpan.hasClass('month')) {

				var direction = (jQuery(this).hasClass('next'))? 'next': 'prev';
				changeMonth(direction);
				changeWeek(direction);
 			}
			else if(textSpan.hasClass('week')) {
				if (jQuery(this).hasClass('next')) {
					changeWeek('next');
				}
				else {
					changeWeek('prev');
				}
			}
		});
	}

	function changeMonth(direction) {

		if (direction == 'next') {
			dateSlider("next");
			var lastMonthMove = '-=' + flags.directionLeftMove;

		} else {
			dateSlider("prev");
			var lastMonthMove = '+=' + flags.directionLeftMove;
		}

		flags.wrap.find('.eventsCalendar-monthWrap.oldMonth').animate({
			opacity: eventsOpts.moveOpacity,
			left: lastMonthMove
		}, eventsOpts.moveSpeed, function() {
			flags.wrap.find('.eventsCalendar-monthWrap.oldMonth').remove();
		});
	}

	function changeWeek(direction)
	{
		if (typeof direction == 'undefined')
		{
			direction = 'next';
		}

		//Get the first start day of the week.
		var day = 0;
		var days = 0;
		jQuery('div.currentMonth ul.eventsCalendar-daysList li.eventsCalendar-day').each(function(key, value)
		{
			if (!jQuery(value).hasClass('empty'))
			{
				days++;
				if (jQuery(value).hasClass('current'))
				{
					day = days;
					return;
				}
			}
		});

		//Clear current week days.
		jQuery('div.currentMonth ul.eventsCalendar-daysList li.eventsCalendar-day').removeClass('current');

		var week = 1;
		var startDay = (direction == 'next')? day: day - 14;

		//If we are going backwards from the beginning strt at end.
		var year = jQuery('#calendar_box').attr('data-current-year');
		var month = jQuery('#calendar_box').attr('data-current-month');
		var monthDays = 32 - new Date(year, month, 32).getDate();
		if (direction == 'prev' && day == 0)
		{
			startDay = monthDays - 7;
		}

		for (var i = startDay + 1, j = (startDay + 7); i <= j; i++)
		{
			(function()
			{
				jQuery('div.currentMonth ul.eventsCalendar-daysList #dayList_'+i.toString()).addClass('current');
			})(i);
		}

		//Set phase data. - throwing an error...
//		flags.wrap.attr('data-current-phase', phase).attr('data-current-day', startDay);

		//Cycle back in a loop i direction of control.
// console.log('day'+day);
// console.log('startDay'+startDay);
// console.log('monthDays'+monthDays);
		if (day != 0 && (startDay >= monthDays || startDay <= -7))
		{
			changeWeek(direction);
		}
	}

	//This function needs to be incorporated into the debugging of the framework.
	function showError(msg) {
		flags.wrap.find('.eventsCalendar-list-wrap').html("<span class='eventsCalendar-loading error'>"+msg+" " +eventsOpts.eventsjson+"</span>");
	}

	function setCalendarWidth(){
		// resize calendar width on window resize
		flags.directionLeftMove = flags.wrap.width();
		flags.wrap.find('.eventsCalendar-monthWrap').width(flags.wrap.width() + 'px');

		flags.wrap.find('.eventsCalendar-list-wrap').width(flags.wrap.width() + 'px');
	}
};


// define the parameters with the default values of the function
jQuery.fn.eventCalendar.defaults = {
	useEvents : true, //default to ues the built in event functionality
    eventsjson: 'js/events.json',
	eventsLimit: 4,
	monthNames: [ "January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December" ],
	dayNames: [ 'Sunday','Monday','Tuesday','Wednesday',
		'Thursday','Friday','Saturday' ],
	dayNamesShort: [ 'Sun','Mon','Tue','Wed', 'Thu','Fri','Sat' ],
	txt_noEvents: "There are no events in this period",
	txt_SpecificEvents_prev: "",
	txt_SpecificEvents_after: "events:",
	txt_next: "next",
	txt_prev: "prev",
	txt_NextEvents: "Next events:",
	txt_GoToEventUrl: "See the event",
	showDayAsWeeks: true,
	startWeekOnMonday: true,
	showDayNameInCalendar: true,
	showDescription: false,
	onlyOneDescription: true,
	openEventInNewWindow: false,
	eventsScrollable: false,
	jsonDateFormat: 'timestamp', // you can use also "human" 'YYYY-MM-DD HH:MM:SS'
	moveSpeed: 500,	// speed of month move when you clic on a new date
	moveOpacity: 0.15, // month and events fadeOut to this opacity
	jsonData: "", 	// to load and inline json (not ajax calls)
	cacheJson: true	// if true plugin get a json only first time and after plugin filter events
					// if false plugin get a new json on each date change
};

