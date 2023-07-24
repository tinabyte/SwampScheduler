import {API_Day, API_Days, API_MeetTime} from "@src/scripts/apiTypes";
import {Term} from "@src/constants/soc";
import {PERIOD_COUNTS} from "@src/constants/schedule";

export class MeetTime {
    term: Term;
    pBegin: number;
    pEnd: number;
    bldg: string;
    room: string;
    locationID: string;

    constructor(term: Term, meetTimeJSON: API_MeetTime) {
        this.term = term;
        this.pBegin = this.parsePeriod(meetTimeJSON.meetPeriodBegin);
        this.pEnd = this.parsePeriod(meetTimeJSON.meetPeriodEnd);
        this.bldg = meetTimeJSON.meetBuilding;
        this.room = meetTimeJSON.meetRoom;
        this.locationID = meetTimeJSON.meetBldgCode;

        // Assume length is one period if either pBegin or pEnd is NaN
        if (isNaN(this.pBegin)) this.pBegin = this.pEnd;
        if (isNaN(this.pEnd)) this.pEnd = this.pBegin;
    }

    private parsePeriod(period: string): number {
        if (period) {
            if (period.charAt(0) == 'E') {
                const periodCounts = PERIOD_COUNTS[this.term];
                return periodCounts.regular + parseInt(period.substring(1));
            }
            return parseInt(period);
        }
        return NaN;
    }

    static formatPeriod(p: number, term: Term) {
        const periodCounts = PERIOD_COUNTS[term];
        return p > periodCounts.regular ? `E${p - periodCounts.regular}` : `${p}`;
    }

    formatPeriods(): string {
        return this.pBegin == this.pEnd
            ? MeetTime.formatPeriod(this.pBegin, this.term)
            : `${MeetTime.formatPeriod(this.pBegin, this.term)}-${MeetTime.formatPeriod(this.pEnd, this.term)}`;
    }

    // Returns true if the meet times conflict (overlap)
    conflictsWith(other: MeetTime): boolean {
        return (this.pBegin <= other.pEnd)
            && (this.pEnd >= other.pBegin);
    }
}

// TODO: Make this Record<API_Day, MeetTime[]>
export class Meetings extends Map<API_Day, MeetTime[]> {
    constructor(meetTimes: [API_Day, MeetTime[]][] = API_Days.map((day: API_Day) => [day, []])) {
        super(meetTimes);
    }
}