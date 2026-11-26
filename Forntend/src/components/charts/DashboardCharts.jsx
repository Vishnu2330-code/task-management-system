import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export const TaskStatusDoughnut = ({ data = {} }) => {
  const chartData = {
    labels: ['To Do', 'In Progress', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [
          data.todoTasks || 0,
          data.inProgressTasks || 0,
          data.completedTasks || 0,
          data.overdueTasks || 0,
        ],
        backgroundColor: [
          '#64748b', // slate
          '#3b82f6', // blue
          '#10b981', // emerald
          '#ef4444', // red
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { family: "'Plus Jakarta Sans', sans-serif", size: 12 },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div style={{ height: '260px', position: 'relative' }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export const TaskPriorityBarChart = ({ data = {} }) => {
  const chartData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Tasks',
        data: [
          data.highPriorityTasks || data.high || 0,
          data.medPriorityTasks || data.med || 0,
          data.lowPriorityTasks || data.low || 0,
        ],
        backgroundColor: ['#f43f5e', '#f59e0b', '#06b6d4'],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div style={{ height: '240px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export const MemberWorkloadBarChart = ({ workload = [] }) => {
  if (!workload || workload.length === 0) {
    return <p className="text-center text-muted py-4">No workload recorded</p>;
  }

  const chartData = {
    labels: workload.map((w) => w.name.split(' ')[0]),
    datasets: [
      {
        label: 'Completed',
        data: workload.map((w) => w.done || 0),
        backgroundColor: '#10b981',
      },
      {
        label: 'In Progress',
        data: workload.map((w) => w.inProgress || 0),
        backgroundColor: '#3b82f6',
      },
      {
        label: 'To Do',
        data: workload.map((w) => w.todo || 0),
        backgroundColor: '#94a3b8',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, ticks: { precision: 0 } },
    },
    plugins: {
      legend: { position: 'bottom' },
    },
  };

  return (
    <div style={{ height: '260px' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default { TaskStatusDoughnut, TaskPriorityBarChart, MemberWorkloadBarChart };

