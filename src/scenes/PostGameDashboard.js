import Phaser from 'phaser';

export default class PostGameDashboard extends Phaser.Scene {
    constructor() {
        super({ key: 'PostGameDashboard' });
    }

    init(data) {
        this.playerStats = data.playerStats;
    }

    preload() {
        this.load.html('chart-container', 'src/dashboard.html');
    }

    async create() {
        const { points, tasksCompleted, choices } = this.playerStats;

        // Add HTML container for charts
        const element = this.add.dom(400, 300).createFromCache('chart-container');

        // Prepare data for charts
        const virtues = {};
        choices.forEach(choice => {
            virtues[choice.virtue] = (virtues[choice.virtue] || 0) + 1;
        });

        const barChartData = {
            labels: ['Points', 'Tasks Completed'],
            datasets: [{
                label: 'Game Stats',
                data: [points, tasksCompleted],
                backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        };

        const doughnutChartData = {
            labels: Object.keys(virtues),
            datasets: [{
                data: Object.values(virtues),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
                borderWidth: 1
            }]
        };

        const sceneCompletionData = {
            labels: ['ApartmentHallway', 'Library', 'Garden', 'Cafe', 'ParkingLot'],
            datasets: [{
                label: 'Tasks Completed Per Scene',
                data: [
                    this.playerStats.scenes['ApartmentHallway']?.tasksCompleted || 0,
                    this.playerStats.scenes['Library']?.tasksCompleted || 0,
                    this.playerStats.scenes['Garden']?.tasksCompleted || 0,
                    this.playerStats.scenes['Cafe']?.tasksCompleted || 0,
                    this.playerStats.scenes['ParkingLot']?.tasksCompleted || 0
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        };

        // Render charts
        this.time.delayedCall(100, () => {
            const ctxBar = document.getElementById('barChart').getContext('2d');
            new Chart(ctxBar, {
                type: 'bar',
                data: barChartData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });

            const ctxDoughnut = document.getElementById('doughnutChart').getContext('2d');
            new Chart(ctxDoughnut, {
                type: 'doughnut',
                data: doughnutChartData
            });

            const ctxSceneBar = document.getElementById('sceneBarChart').getContext('2d');
            new Chart(ctxSceneBar, {
                type: 'bar',
                data: sceneCompletionData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

        const qualityAnalysisData = await fetch('/api/quality-analysis').then(res => res.json());

        const qualityChartData = {
            labels: Object.keys(qualityAnalysisData),
            datasets: [{
                data: Object.values(qualityAnalysisData),
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1
            }]
        };

        this.time.delayedCall(100, () => {
            const ctxQuality = document.getElementById('qualityChart').getContext('2d');
            new Chart(ctxQuality, {
                type: 'pie',
                data: qualityChartData
            });
        });
    }
}