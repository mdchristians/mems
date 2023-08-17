import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import objectSupport from "dayjs/plugin/objectSupport";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(objectSupport);

dayjs.tz.setDefault("America/Chicago");
