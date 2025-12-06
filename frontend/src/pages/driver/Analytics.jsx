import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { FileText, Clock, CheckCircle, XCircle, TrendingUp, DollarSign, Activity, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const DriverAnalytics = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const container = document.querySelector('.min-h-screen');

        if (!container) return;

        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '0';
        canvas.style.opacity = '0.3';

        container.style.position = 'relative';
        container.appendChild(canvas);

        const resizeCanvas = () => {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        class Particle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 1;
                this.speed = Math.random() * 0.4 + 0.1;
                this.opacity = Math.random() * 0.2 + 0.1;
                this.color = document.documentElement.classList.contains('dark')
                    ? Math.random() > 0.7 ? '#1e40af' : '#3b82f6'
                    : Math.random() > 0.7 ? '#1e3a8a' : '#1d4ed8';
            }

            update() {
                this.y += this.speed;
                if (this.y > canvas.height) {
                    this.reset();
                    this.y = -10;
                }
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const particles = Array.from({ length: 25 }, () => new Particle());

        const animate = () => {
            if (!ctx) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (canvas.parentNode) {
                canvas.parentNode.removeChild(canvas);
            }
        };
    }, []);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await api.get('/accidents');
            setReports(response.data.reports || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to fetch analytics data');
        } finally {
            setLoading(false);
        }
    };


    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.claimId?.status === 'in_review' || r.claimId?.status === 'pending').length,
        approved: reports.filter(r => r.claimId?.status === 'approved').length,
        rejected: reports.filter(r => r.claimId?.status === 'rejected').length,
        totalCost: reports.reduce((sum, r) => sum + (r.repair_cost?.estimated_cost || 0), 0),
        avgCost: reports.length > 0 ? reports.reduce((sum, r) => sum + (r.repair_cost?.estimated_cost || 0), 0) / reports.length : 0,
    };


    const statusData = [
        { name: 'Pending', value: stats.pending, color: '#eab308' },
        { name: 'Approved', value: stats.approved, color: '#22c55e' },
        { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
    ];


    const severityData = [
        { name: 'Severe', value: reports.filter(r => r.prediction?.severity === 'severe').length, color: '#ef4444' },
        { name: 'Moderate', value: reports.filter(r => r.prediction?.severity === 'moderate').length, color: '#f97316' },
        { name: 'Minor', value: reports.filter(r => r.prediction?.severity === 'minor').length, color: '#22c55e' },
    ].filter(item => item.value > 0);


    const getTimelineData = () => {
        if (reports.length === 0) return [];

        const reportsByDate = {};
        reports.forEach(report => {
            const date = format(parseISO(report.createdAt), 'MMM dd');
            if (!reportsByDate[date]) {
                reportsByDate[date] = { date, cost: 0, count: 0 };
            }
            reportsByDate[date].count++;
            reportsByDate[date].cost += report.repair_cost?.estimated_cost || 0;
        });

        return Object.values(reportsByDate).sort((a, b) => {
            const dateA = new Date(a.date + ', 2024');
            const dateB = new Date(b.date + ', 2024');
            return dateA - dateB;
        });
    };

    const timelineData = getTimelineData();

    const StatCard = ({ title, value, icon: Icon, color, description, prefix = '' }) => (
        <div className="card rounded-2xl p-6 border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{title}</p>
                    {loading ? (
                        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {prefix}{typeof value === 'number' && prefix === '$' ? value.toLocaleString() : value}
                        </p>
                    )}
                    {description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} bg-opacity-10`}>
                    <Icon className={`w-6 h-6 ${color.replace('text-', 'text-')}`} />
                </div>
            </div>
        </div>
    );

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Count: {payload[0].value}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        Percentage: {((payload[0].value / stats.total) * 100).toFixed(1)}%
                    </p>
                </div>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading analytics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-blue-700 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                            My Analytics
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                            Insights into your accident reports and claims
                        </p>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700">
                        <Activity className="w-4 h-4" />
                        <span>Real-time Data</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Reports"
                        value={stats.total}
                        icon={FileText}
                        color="text-blue-600 dark:text-blue-400"
                        description="All submitted reports"
                    />
                    <StatCard
                        title="Pending Claims"
                        value={stats.pending}
                        icon={Clock}
                        color="text-yellow-600 dark:text-yellow-400"
                        description="In review"
                    />
                    <StatCard
                        title="Total Estimated Cost"
                        value={stats.totalCost}
                        icon={DollarSign}
                        color="text-green-600 dark:text-green-400"
                        description="Cumulative damage cost"
                        prefix="$"
                    />
                    <StatCard
                        title="Avg. Repair Cost"
                        value={Math.round(stats.avgCost)}
                        icon={TrendingUp}
                        color="text-purple-600 dark:text-purple-400"
                        description="Per accident"
                        prefix="$"
                    />
                </div>

                {reports.length === 0 ? (
                    <div className="card rounded-3xl p-12 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl text-center">
                        <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Data Available</h3>
                        <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                            You haven't submitted any accident reports yet.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Claims Status</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={statusData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <YAxis
                                            stroke="#6b7280"
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                                        <Bar
                                            dataKey="value"
                                            radius={[8, 8, 0, 0]}
                                            activeBar={({ x, y, width, height, fill }) => (
                                                <rect
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    fill={fill}
                                                    rx={8}
                                                    ry={8}
                                                    style={{ filter: 'drop-shadow(0 0 8px ' + fill + ')' }}
                                                />
                                            )}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Severity Distribution</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={severityData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {severityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {timelineData.length > 0 && (
                                <div className="card rounded-3xl p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl lg:col-span-2">
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-2 h-8 bg-gradient-to-b from-blue-600 to-blue-400 rounded-full"></div>
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Cost Timeline</h2>
                                    </div>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={timelineData}>
                                            <defs>
                                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#6b7280"
                                                style={{ fontSize: '12px' }}
                                            />
                                            <YAxis
                                                yAxisId="left"
                                                stroke="#6b7280"
                                                style={{ fontSize: '12px' }}
                                            />
                                            <YAxis
                                                yAxisId="right"
                                                orientation="right"
                                                stroke="#6b7280"
                                                style={{ fontSize: '12px' }}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area
                                                yAxisId="right"
                                                type="monotone"
                                                dataKey="cost"
                                                stroke="#3b82f6"
                                                fillOpacity={1}
                                                fill="url(#colorCost)"
                                                name="Estimated Cost ($)"
                                            />
                                            <Line
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#22c55e"
                                                strokeWidth={2}
                                                name="Reports Count"
                                                dot={false}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DriverAnalytics;
