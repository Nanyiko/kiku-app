const leMap = [
  {
    label: "Artists",
    value: "Artists",
  },
  {
    label: "Tracks",
    value: "Tracks",
  },
];
const labels = [];
const values = [];
for (let item of leMap) {
  labels.push(item.label);
  values.push(item.value);
}
console.log(labels, typeof labels);
