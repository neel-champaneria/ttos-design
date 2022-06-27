import {
  format,
  getDay,
  getHours,
  getMinutes,
  isAfter,
  isBefore,
  isEqual,
  parse,
  addMinutes,
  subMinutes,
} from "date-fns";
import { timeSlots } from "../constants";

export const emailRegex = "^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,4}$";

export const singaporePhoneRegex =
  "^[6|8|9]\\d{7}$|^\\+65[6|8|9]\\d{7}$|^\\+65\\s[6|8|9]\\d{7}$";

export const removeSpecialChars = (str) => {
  const map = {
    "&": "",
    "<": "",
    ">": "",
    '"': "",
    "'": "",
    "/": "",
    "`": "",
    "=": "",
    "#": "",
  };
  return str.replace(/[&<>"'`#=\/]/g, function (m) {
    return map[m];
  });
};

export const splitArrIntoHalf = (arr) => {
  // use ceil to get firstHalf > secondHalf if arr length is odd
  const cloneArr = deepClone(arr, []);
  let middle = Math.ceil(cloneArr.length / 2);
  let firstHalf = cloneArr.slice(0, middle);
  let secondHalf = cloneArr.slice(middle, cloneArr.length);

  return { firstHalf, secondHalf };
};

export const splitArrUtil = (arr, offset = 0) => {
  // use ceil to get firstHalf > secondHalf if arr length is odd
  const cloneArr = deepClone(arr, []);
  let middle = Math.ceil(cloneArr.length / 2) + offset;
  let firstHalf = cloneArr.slice(0, middle);
  let secondHalf = cloneArr.slice(middle, cloneArr.length);

  return { firstHalf, secondHalf };
};

export const checkShowChangeTimeBtn = (resOrders, minPrepareTime) => {
  minPrepareTime = minPrepareTime || 0;
  const tempOrders = resOrders?.map((order) => {
    const orderDeliveryDateTime = order?.deliveryDateTime
      ? new Date(order.deliveryDateTime)
      : null;
    if (orderDeliveryDateTime != null) {
      if (
        orderDeliveryDateTime.getTime() >=
        new Date().getTime() + parseInt(minPrepareTime, 10) * 60 * 1000 + 30000
      ) {
        order.showChangeTimeBtn = true;
      } else {
        order.showChangeTimeBtn = false;
      }
    } else {
      order.showChangeTimeBtn = false;
    }
    return order;
  });
  return tempOrders;
};

export const zeroPad = (num, size) => {
  num = num.toString();
  while (num.length < size) num = "0" + num;
  return num;
};

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const getNewTimeWithAdvance = (time, advance) => {
  var openTimeParts = time.split(":");
  var openTimeInMins =
    parseInt(openTimeParts[0], 10) * 60 + parseInt(openTimeParts[1]) + advance;
  var newTime =
    zeroPad(parseInt(openTimeInMins / 60, 10), 2) +
    ":" +
    zeroPad(parseInt(openTimeInMins % 60, 10), 2);
  return newTime;
};

export const verifyCheckoutDateTime = (
  isPreOrder,
  deliveryDateTime,
  openingDaysArr,
  openTime,
  closeTime,
  advance
) => {
  var checkoutTimeOk = true;
  if (openTime > closeTime) {
    console.log("Closing next day");
    var checkoutDateTime = new Date();
    if (isPreOrder) {
      checkoutDateTime = parse(
        deliveryDateTime,
        "dd-MM-yyyy HH:mm:ss",
        new Date()
      );
    }
    if (isBefore(checkoutDateTime, new Date())) {
      checkoutTimeOk = false;
    } else {
      var checkoutDay = getDay(checkoutDateTime) + 1;
      var checkoutTime = format(checkoutDateTime, "HH:mm");

      if (checkoutTime < openTime) {
        var checkoutTimeParts = checkoutTime.split(":");
        var checkoutHours = parseInt(checkoutTimeParts[0], 10);
        checkoutHours += 24;
        checkoutTime =
          checkoutHours +
          ":" +
          checkoutTimeParts[1] +
          ":" +
          checkoutTimeParts[2];
      }
      var newCloseTime = closeTime;
      if (checkoutTime > newCloseTime) {
        var closeTimeParts = closeTime.split(":");
        var closeHours = parseInt(closeTimeParts[0], 10);
        closeHours += 24;
        newCloseTime = closeHours + ":" + closeTimeParts[1] + ":00";
      }

      //modify openTime and closeTime for order later
      console.log("Original Open Time", openTime);
      console.log("Original Close Time", newCloseTime);
      if (advance > 0) {
        openTime = getNewTimeWithAdvance(openTime, advance);
        newCloseTime = getNewTimeWithAdvance(newCloseTime, -advance);
        console.log("New Open Time with advance", openTime);
        console.log("New Close Time with advacne", newCloseTime);
      }
      checkoutTimeOk =
        checkoutTime >= openTime &&
        checkoutTime <= newCloseTime &&
        (openingDaysArr.includes("" + checkoutDay) ||
          (!openingDaysArr.includes("" + checkoutDay) &&
            checkoutTime < newCloseTime));
    }
    console.log(checkoutTimeOk);
  } else {
    console.log("Closing same day");
    var checkoutDateTime = new Date();
    if (isPreOrder) {
      checkoutDateTime = parse(
        deliveryDateTime,
        "dd-MM-yyyy HH:mm:ss",
        new Date()
      );
    }
    var checkoutDay = getDay(checkoutDateTime) + 1;
    var checkoutTime = format(checkoutDateTime, "HH:mm");
    //modify openTime and closeTime for order later
    console.log("Original Open Time", openTime);
    console.log("Original Close Time", closeTime);
    if (advance > 0) {
      openTime = getNewTimeWithAdvance(openTime, advance);
      closeTime = getNewTimeWithAdvance(closeTime, -advance);
      console.log("New Open Time with advance", openTime);
      console.log("New Close Time with advacne", closeTime);
    }
    checkoutTimeOk =
      checkoutTime >= openTime &&
      checkoutTime <= closeTime &&
      (openingDaysArr.includes("" + checkoutDay) ||
        (!openingDaysArr.includes("" + checkoutDay) &&
          checkoutTime < closeTime));
    console.log(checkoutTimeOk);
  }
  return checkoutTimeOk;
};

export const sortModifiers = (modifiers, dir, sortField) => {
  modifiers = modifiers ? modifiers : [];
  dir = dir ? dir : "asc";
  sortField = sortField ? sortField : "price";
  return modifiers.sort((a, b) => {
    if (dir === "asc") {
      return a[sortField] - b[sortField];
    } else if (dir === "desc") {
      return b[sortField] - a[sortField];
    }
  });
};

export const sortModifierGroupItems = (modifierGroupItems, dir, sortField) => {
  modifierGroupItems = modifierGroupItems ? modifierGroupItems : [];
  dir = dir ? dir : "asc";
  sortField = sortField ? sortField : "price";
  return modifierGroupItems.sort((a, b) => {
    if (dir === "asc") {
      return a[sortField] - b[sortField];
    } else if (dir === "desc") {
      return b[sortField] - a[sortField];
    }
  });
};

export const deepClone = (obj, objType) => {
  if (!objType) {
    console.error("You have to specify your object type, {} or []");
    return null;
  }
  return JSON.parse(JSON.stringify(obj || objType));
};

export const getDayName = (day) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  let _day = 0;
  if (day) {
    _day = parseInt(day, 10);
  }
  return days[_day];
};

export const sortTimeRangeAsc = (arr) => {
  // Sort array of time range to be ascending
  return arr.slice().sort((a, b) => {
    if (a.timeFrom < b.timeFrom) return -1;
    else if (a.timeFrom > b.timeFrom) return 1;
    else return 0;
  });
};

export const mergeOverlapTimeRange = (arr) => {
  const _arr = JSON.parse(JSON.stringify(arr));
  let j = 0;
  while (j < _arr.length - 1) {
    const a = _arr[j];
    const b = _arr[j + 1];
    if (a.timeTo >= b.timeFrom && a.timeTo < b.timeTo) {
      // Time range b intersect with time range a
      a.timeTo = b.timeTo;
      _arr.splice(j + 1, 1);
    } else if (a.timeTo > b.timeFrom && a.timeTo >= b.timeTo) {
      // Time range b overlapping with time range a (b in a)
      _arr.splice(j + 1, 1);
    } else {
      j++;
    }
  }
  return _arr;
};

export const generateOpenCloseTimeOfDay = (
  deliveryDate,
  orderingMethod,
  openingDaysObj,
  specialDaysObj,
  pauseServiceObj,
  advanceObj
) => {
  const openCloseTimeOfDaysObj = {};
  const deliveryDay = parse(deliveryDate, "dd-MM-yyyy", new Date()).getDay();
  const deliveryDateObj = parse(deliveryDate, "dd-MM-yyyy", new Date());
  const isDeliveryDateAfterToday = isAfter(deliveryDateObj, new Date());
  let checkoutTime = format(new Date(), "HH:mm");
  const advance = advanceObj[orderingMethod] || 0;
  let openingDatas = openingDaysObj[orderingMethod] || [];

  // MODIFY DELIVERY DATE IN openCloseTimeOfDaysObj BASE ON NORMAL OPERATION SETTINGS
  if (openingDatas.length == 0) {
    openingDatas = openingDaysObj["opening"] || [];
  }

  for (let i = 0; i < openingDatas.length; i++) {
    const openingData = openingDatas[i];
    const openingDaysArr = openingData["opening_days"]
      ?.split(",")
      .filter(Boolean)
      ?.sort((a, b) => a - b);
    let openTime = openingData["open_time"]?.substr(0, 5);
    let closeTime = openingData["close_time"]?.substr(0, 5);
    const openTimeAdvance = getNewTimeWithAdvance(openTime, advance);
    const closeTimeAdvance = getNewTimeWithAdvance(closeTime, -advance);
    if (advance > 0) {
      if (openTimeAdvance <= "24:00") {
        openTime = openTimeAdvance;
      }
      closeTime = closeTimeAdvance;
    }
    openingDaysArr.map((d) => {
      if (d - 1 == deliveryDay) {
        if (closeTime > openTime) {
          // console.log(openCloseTimeOfDaysObj);
          if (openCloseTimeOfDaysObj?.hasOwnProperty(deliveryDay)) {
            let temp = openCloseTimeOfDaysObj[deliveryDay];
            temp.push({
              timeFrom: openTime,
              timeTo: closeTime,
            });
            openCloseTimeOfDaysObj[deliveryDay] = temp;
          } else {
            openCloseTimeOfDaysObj[deliveryDay] = [
              {
                timeFrom: openTime,
                timeTo: closeTime,
              },
            ];
          }
        } else if (closeTime < openTime) {
          console.log(
            "openCloseTimeOfDaysObj===>",
            openCloseTimeOfDaysObj,
            deliveryDay
          );
          if (openCloseTimeOfDaysObj?.hasOwnProperty(deliveryDay)) {
            let temp = openCloseTimeOfDaysObj[deliveryDay];
            temp.push(
              {
                timeFrom: "00:00",
                timeTo: closeTime,
              },
              {
                timeFrom: openTime,
                timeTo: "23:59",
              }
            );
            openCloseTimeOfDaysObj[deliveryDay] = temp;
          } else {
            openCloseTimeOfDaysObj[deliveryDay] = [
              {
                timeFrom: "00:00",
                timeTo: closeTime,
              },
              {
                timeFrom: openTime,
                timeTo: "23:59",
              },
            ];
          }
        }
      }
    });
  }

  // MODIFY DELIVERY DATE IN openCloseTimeOfDaysObj BASE ON SPECIAL OPERATION SETTINGS
  if (specialDaysObj.length > 0) {
    for (let i = 0; i < specialDaysObj.length; i++) {
      const specialDays = specialDaysObj[i];
      const specialOperationDateFrom = specialDays.specialOperationDateFrom;
      const specialOperationDateTo = specialDays.specialOperationDateTo;
      const specialOperationDateFromObj = parse(
        specialOperationDateFrom,
        "dd-MM-yyyy",
        new Date()
      );
      const specialOperationDateToObj = parse(
        specialOperationDateTo,
        "dd-MM-yyyy",
        new Date()
      );

      // Check if delivery date is in special day
      let inSpecialDay =
        (isAfter(deliveryDateObj, specialOperationDateFromObj) ||
          isEqual(deliveryDateObj, specialOperationDateFromObj)) &&
        (isBefore(deliveryDateObj, specialOperationDateToObj) ||
          isEqual(deliveryDateObj, specialOperationDateToObj));
      // console.log('inSpecialDay =====>', inSpecialDay);

      const specialOperationServices =
        specialDays.specialOperationServices.find(
          (itm) => itm.service === orderingMethod
        ) ||
        specialDays.specialOperationServices.find(
          (itm) => itm.service === "opening"
        );
      // console.log('specialOperationServices ===>', specialOperationServices);
      if (specialOperationServices?.id > 0) {
        // console.log('specialOperationServices ===>', specialOperationServices);
        const isOpened = specialOperationServices?.["isOpened"];
        const between = specialOperationServices?.["between"];
        const refineBetween = [];
        // Split time to 2 range if timeFrom < time To
        between.map((itm) => {
          if (itm.timeTo < itm.timeFrom) {
            const range_1 = { timeFrom: itm.timeFrom, timeTo: "23:59" };
            const range_2 = { timeFrom: "00:00", timeTo: itm.timeTo };
            refineBetween.push(range_1);
            refineBetween.push(range_2);
          } else {
            refineBetween.push(itm);
          }
        });
        // console.log('Refine between ===>',refineBetween);
        const sortedBetween = sortTimeRangeAsc(refineBetween);
        // console.log('between before merge ===>',sortedBetween);
        const mergeBetween = mergeOverlapTimeRange(sortedBetween);
        // console.log('between after merge ===>',mergeBetween);
        let result = mergeBetween;
        if (advance > 0) {
          const advanceBetween = deepClone(mergeBetween, []);
          advanceBetween.map((itm, idx) => {
            const openTimeAdvance = getNewTimeWithAdvance(
              itm.timeFrom,
              advance
            );
            let closeTimeAdvance = getNewTimeWithAdvance(itm.timeTo, -advance);
            if (openTimeAdvance <= "24:00") {
              itm.timeFrom = openTimeAdvance;
            }
            if (closeTimeAdvance < openTimeAdvance) {
              closeTimeAdvance =
                parseInt(closeTimeAdvance.substr(0, 2), 10) +
                24 +
                closeTimeAdvance.substr(2) +
                "";
            }
            if (closeTimeAdvance >= "23:59") closeTimeAdvance = "24:00";
            // if (idx === advanceBetween.length) {
            itm.timeTo = closeTimeAdvance;
            // }
            return itm;
          });
          // console.log(advanceBetween);
          result = advanceBetween.filter((bt) => {
            return bt.timeTo >= bt.timeFrom;
          });
        }
        // console.log('result ===>',result);
        if (inSpecialDay) {
          if (isOpened) {
            openCloseTimeOfDaysObj[deliveryDay] = result;
          } else {
            openCloseTimeOfDaysObj[deliveryDay] = null;
          }
        }
      } else {
        inSpecialDay = false;
      }
    }
  }

  // MODIFY DELIVERY DATE IN openCloseTimeOfDaysObj BASE ON PAUSE SERVICE SETTINGS
  if (
    pauseServiceObj &&
    pauseServiceObj?.pauseService?.includes(orderingMethod)
  ) {
    // console.log('openCloseTimeArr before pause ===>', openCloseTimeOfDaysObj[deliveryDay]);
    let newOpenCloseTimeArr = deepClone(
      openCloseTimeOfDaysObj[deliveryDay],
      []
    );
    const duration = pauseServiceObj.duration;
    const restOfDay = pauseServiceObj.restOfDay;
    const startPDateStr = pauseServiceObj.startTime.split(" ")[0];
    const startPDay = parse(startPDateStr, "dd-MM-yyyy", new Date()).getDay();
    const startPTime = pauseServiceObj.startTime.split(" ")[1];
    const endPTime = getNewTimeWithAdvance(startPTime, duration);
    // console.log('Pause Time Range ===>', startPTime, endPTime, 'isDeliveryDateAfterToday ===>', isDeliveryDateAfterToday);
    if (startPDay == deliveryDay && !isDeliveryDateAfterToday) {
      if (restOfDay) {
        // CASE REST OF DAY
        for (let i = 0; i < newOpenCloseTimeArr.length; i++) {
          let timeFrom = newOpenCloseTimeArr[i].timeFrom;
          let timeTo = newOpenCloseTimeArr[i].timeTo;
          if (startPTime >= timeFrom && startPTime <= timeTo) {
            newOpenCloseTimeArr[i].timeTo = startPTime;
          }
          if (startPTime <= timeFrom) {
            newOpenCloseTimeArr.splice(i, newOpenCloseTimeArr.length);
          }
        }
      } else {
        // CASE NOT REST OF DAY
        console.log(newOpenCloseTimeArr);
        let tmpOpenCloseTimeArr = [];
        for (let i = 0; i < newOpenCloseTimeArr.length; i++) {
          let newRange = {};
          let timeFrom = newOpenCloseTimeArr[i].timeFrom;
          let timeTo = newOpenCloseTimeArr[i].timeTo;
          if (startPTime <= timeFrom && endPTime >= timeTo) {
            continue;
          } else if (
            startPTime <= timeFrom &&
            endPTime < timeTo &&
            endPTime > timeFrom
          ) {
            newRange.timeFrom = endPTime;
            newRange.timeTo = timeTo;
            tmpOpenCloseTimeArr.push(newRange);
          } else if (
            startPTime > timeFrom &&
            startPTime < timeTo &&
            endPTime >= timeTo
          ) {
            newRange.timeFrom = timeFrom;
            newRange.timeTo = startPTime;
            tmpOpenCloseTimeArr.push(newRange);
          } else if (startPTime > timeFrom && endPTime < timeTo) {
            newRange.timeFrom = timeFrom;
            newRange.timeTo = startPTime;
            tmpOpenCloseTimeArr.push(newRange);
            let secondNewRange = {};
            secondNewRange.timeFrom = endPTime;
            secondNewRange.timeTo = timeTo;
            tmpOpenCloseTimeArr.push(secondNewRange);
          } else {
            tmpOpenCloseTimeArr.push(newOpenCloseTimeArr[i]);
          }
        }
        newOpenCloseTimeArr = tmpOpenCloseTimeArr;
      }
      openCloseTimeOfDaysObj[deliveryDay] = newOpenCloseTimeArr;
    }
    // console.log('openCloseTimeArr after pause =================>', deliveryDay, newOpenCloseTimeArr);
  }

  // FINAL STEP
  // REMOVE ALL TIME RANGE BEFORE CURRENT TIME IF DELIVERY DATE IS TODAY
  if (!isDeliveryDateAfterToday) {
    let newOpenCloseTimeArr = deepClone(
      openCloseTimeOfDaysObj[deliveryDay],
      []
    );
    // console.log('before filter =================>', deliveryDay, newOpenCloseTimeArr);
    const curTimeStr = format(new Date(), "HH:mm");
    newOpenCloseTimeArr = newOpenCloseTimeArr?.filter((obj) => {
      return (
        (curTimeStr < obj.timeTo && curTimeStr > obj.timeFrom) ||
        curTimeStr < obj.timeFrom
      );
    });
    openCloseTimeOfDaysObj[deliveryDay] = newOpenCloseTimeArr;
    // console.log('after filter =================>', deliveryDay, newOpenCloseTimeArr);
  }

  const _getTimeRangesOfDay = () => {
    const arr = deepClone(openCloseTimeOfDaysObj[deliveryDay], []);
    return arr;
  };

  return {
    getTimeRangesOfDay: _getTimeRangesOfDay,
  };
};

export const generateTimeArr = (
  openTimeOfDeliveryDayStr,
  closeTimeOfDeliveryDayStr,
  deliveryDate
) => {
  const _timeArr = [];
  const isDeliveryDateAfterToday = isAfter(
    parse(deliveryDate, "dd-MM-yyyy", new Date()),
    new Date()
  );
  const curTimeStr = format(new Date(), "HH:mm");
  let maxHour = 24;
  let curHour = getHours(new Date());
  let hourStr = "";
  let curMinute = getMinutes(new Date());
  const minIntervalArr = ["00", "15", "30", "45"];

  // console.log('isDeliveryDateAfterToday ===>',isDeliveryDateAfterToday);
  // console.log('openTimeOfDeliveryDayStr ===>',openTimeOfDeliveryDayStr);
  // console.log('closeTimeOfDeliveryDayStr ===>',closeTimeOfDeliveryDayStr);
  if (closeTimeOfDeliveryDayStr == "00:00") closeTimeOfDeliveryDayStr = "23:59";
  let minHour = curHour;
  if (
    curTimeStr < openTimeOfDeliveryDayStr.substr(0, 5) ||
    isDeliveryDateAfterToday
  ) {
    minHour = parseInt(openTimeOfDeliveryDayStr.substr(0, 2), 10);
  }

  let minHourMin = parseInt(openTimeOfDeliveryDayStr.split(":")[1], 10);
  if (curMinute < minHourMin || isDeliveryDateAfterToday)
    curMinute = minHourMin;

  if (closeTimeOfDeliveryDayStr) {
    maxHour = parseInt(closeTimeOfDeliveryDayStr.substr(0, 2), 10);
  }

  if (maxHour < minHour) maxHour += 24;
  let remainingHour = maxHour - minHour;
  for (let i = 0; i <= remainingHour; i++) {
    hourStr = "";
    minHour = parseInt(minHour, 10) + (i == 0 ? 0 : 1);
    if (minHour >= 24) minHour = minHour - 24;
    if (parseInt(minHour, 10) < 10) {
      hourStr = `0${minHour}`;
    } else {
      hourStr = `${minHour}`;
    }
    minIntervalArr.forEach((minInterval) => {
      if (
        curMinute <= parseInt(minInterval, 10) ||
        i > 0 ||
        minHour > curHour
      ) {
        const _time = `${hourStr}:${minInterval}:00`;
        if (minHour > curHour) {
          if (
            `${hourStr}:${minInterval}` >= openTimeOfDeliveryDayStr &&
            `${hourStr}:${minInterval}` <= closeTimeOfDeliveryDayStr
          )
            _timeArr.push(_time);
        } else {
          if (
            `${hourStr}:${minInterval}` >= openTimeOfDeliveryDayStr &&
            `${hourStr}:${minInterval}` <= closeTimeOfDeliveryDayStr
          )
            _timeArr.push(_time);
        }
      }
    });
  }
  // console.log('generateTimeArr 1 ===>', _timeArr);
  let maxHourMin = parseInt(closeTimeOfDeliveryDayStr.split(":")[1], 10);
  if (maxHourMin % 15 == 0) {
    if (
      minHour < maxHour &&
      _timeArr[_timeArr.length - 1] < closeTimeOfDeliveryDayStr
    ) {
      _timeArr.push(`${closeTimeOfDeliveryDayStr}:00`);
    }
  } else {
    maxHourMin = maxHourMin - (maxHourMin % 15);
    if (
      minHour < maxHour &&
      _timeArr[_timeArr.length - 1] < closeTimeOfDeliveryDayStr
    ) {
      if (parseInt(maxHourMin, 10) < 10) {
        maxHourMin = `0${maxHourMin}`;
      } else {
        maxHourMin = `${maxHourMin}`;
      }
      _timeArr.push(`${maxHour}:${maxHourMin}:00`);
    }
  }
  // console.log('generateTimeArr 2 ===>', _timeArr);
  return _timeArr;
};

export const generateTimeArrWithSlot = (
  openTimeOfDeliveryDayStr,
  closeTimeOfDeliveryDayStr,
  deliveryDate,
  slot
) => {
  const _timeArr = [];
  const isDeliveryDateAfterToday = isAfter(
    parse(deliveryDate, "dd-MM-yyyy", new Date()),
    new Date()
  );
  const curTimeStr = format(new Date(), "HH:mm");
  let maxHour = 24;
  let curHour = getHours(new Date());
  let hourStr = "";
  let curMinute = getMinutes(new Date());
  let minIntervalArr = ["00"];
  if (slot == 15) {
    minIntervalArr = ["00", "15", "30", "45"];
  } else if (slot == 30) {
    minIntervalArr = ["00", "30"];
  } else if (slot == 45) {
    minIntervalArr = ["45"];
  }

  // console.log('isDeliveryDateAfterToday ===>',isDeliveryDateAfterToday);
  // console.log('openTimeOfDeliveryDayStr ===>',openTimeOfDeliveryDayStr);
  // console.log('closeTimeOfDeliveryDayStr ===>',closeTimeOfDeliveryDayStr);
  if (closeTimeOfDeliveryDayStr == "00:00") closeTimeOfDeliveryDayStr = "23:59";
  let minHour = curHour;
  if (
    curTimeStr < openTimeOfDeliveryDayStr.substr(0, 5) ||
    isDeliveryDateAfterToday
  ) {
    minHour = parseInt(openTimeOfDeliveryDayStr.substr(0, 2), 10);
  }

  let minHourMin = parseInt(openTimeOfDeliveryDayStr.split(":")[1], 10);
  if (curMinute < minHourMin || isDeliveryDateAfterToday)
    curMinute = minHourMin;

  if (closeTimeOfDeliveryDayStr) {
    maxHour = parseInt(closeTimeOfDeliveryDayStr.substr(0, 2), 10);
  }

  if (maxHour < minHour) maxHour += 24;
  let remainingHour = maxHour - minHour;
  let found = false;
  let startTime = "";
  for (let i = 0; i <= remainingHour; i++) {
    hourStr = "";
    minHour = parseInt(minHour, 10) + (i == 0 ? 0 : 1);
    if (minHour >= 24) minHour = minHour - 24;
    if (parseInt(minHour, 10) < 10) {
      hourStr = `0${minHour}`;
    } else {
      hourStr = `${minHour}`;
    }
    minIntervalArr.forEach((minInterval) => {
      if (!found) {
        if (
          curMinute <= parseInt(minInterval, 10) ||
          i > 0 ||
          minHour >= curHour
        ) {
          let _time = `${hourStr}:${minInterval}:00`;
          if (minHour >= curHour) {
            if (
              `${hourStr}:${minInterval}` >= openTimeOfDeliveryDayStr &&
              `${hourStr}:${minInterval}` <= closeTimeOfDeliveryDayStr
            ) {
              startTime = _time;
              found = true;
            }
          } else {
            if (
              `${hourStr}:${minInterval}` >= openTimeOfDeliveryDayStr &&
              `${hourStr}:${minInterval}` <= closeTimeOfDeliveryDayStr
            ) {
              startTime = _time;
              found = true;
            }
          }
          if (!found) {
            const timeObj = parse(_time, "HH:mm:ss", new Date());
            _time = format(addMinutes(timeObj, slot), "HH:mm:ss");
            if (minHour >= curHour) {
              if (
                _time >= openTimeOfDeliveryDayStr &&
                _time <= closeTimeOfDeliveryDayStr
              ) {
                startTime = _time;
                found = true;
              }
            } else {
              if (
                _time >= openTimeOfDeliveryDayStr &&
                _time <= closeTimeOfDeliveryDayStr
              ) {
                startTime = _time;
                found = true;
              }
            }
          }
        }
      }
    });
    if (found) {
      let _time = startTime;
      const timeObj = parse(_time, "HH:mm:ss", new Date());
      _time = format(subMinutes(timeObj, 15), "HH:mm:ss");
      if (minHour >= curHour) {
        if (
          _time >= openTimeOfDeliveryDayStr &&
          _time <= closeTimeOfDeliveryDayStr
        ) {
          startTime = _time;
          found = true;
        }
      } else {
        if (
          _time >= openTimeOfDeliveryDayStr &&
          _time <= closeTimeOfDeliveryDayStr
        ) {
          startTime = _time;
          found = true;
        }
      }
      break;
    }
  }
  if (found) {
    let temp;
    do {
      if (startTime == "23:59:00") {
        startTime = "24:00:00";
        _timeArr.push(startTime);
        break;
      }
      _timeArr.push(startTime);
      temp = startTime;
      const startTimeObj = parse(startTime, "HH:mm:ss", new Date());
      startTime = format(addMinutes(startTimeObj, slot), "HH:mm:ss");
      if (startTime == "00:00:00") startTime = "23:59:00";
    } while (
      startTime <= closeTimeOfDeliveryDayStr + ":00" &&
      temp < startTime
    );
  }
  return _timeArr;
};
