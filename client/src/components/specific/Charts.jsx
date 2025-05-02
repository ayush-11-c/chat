import {
  ArcElement,
  CategoryScale,
  Chart as ChartJs,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { getLastDays } from "../../lib/features";
ChartJs.register(
  Tooltip,
  Filler,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Legend
);
const lineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Line Chart",
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};
const LineChart = ({ value = [1, 3, 2, 2, 3, 5] }) => {
  const data = {
    labels: getLastDays(),
    datasets: [
      {
        label: "Messages",
        data: value,
        borderColor: ["rgba(54, 162, 235, 1)"],
        backgroundColor: ["rgba(54, 162, 235, 0.2)"],
        pointBackgroundColor: "rgba(54, 162, 235, 1)",
        pointBorderColor: "rgba(54, 162, 235, 1)",
      },
    ],
  };
  return <Line data={data} options={lineChartOptions} />;
};
const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
    title: {
      display: true,
      text: "Doughnut Chart",
    },
  },
};
const DonutChart = ({ value = [], labels = [] }) => {
  const data = {
    labels,
    datasets: [
      {
        label: "Chats VS Group Chats",
        data: value,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
        offset: 40,
      },
    ],
  };
  return (
    <Doughnut style={{ zIndex: 10 }} data={data} options={doughnutOptions} />
  );
};

export { DonutChart, LineChart };
