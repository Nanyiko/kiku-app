import moment from "moment";

const myList = [
  "2026-11-05T00:28:22.393Z",
  "2026-11-07T06:25:32.123Z",
  "2026-11-07T06:23:40.595Z",
  "2026-11-07T06:18:41.650Z",
  "2026-11-07T06:15:35.288Z",
];

const sortedList = myList.sort((a, b) => {
  const timestampA = new Date(a).getTime();
  const timestampB = new Date(b).getTime();

  return timestampB - timestampA;
});

for (let time of sortedList) {
  console.log(moment(time).fromNow());
}
