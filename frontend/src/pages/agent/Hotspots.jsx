import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';
import { Loader, MapPin, AlertTriangle, TrendingUp, AlertCircle } from 'lucide-react';

const AgentHotspots = () => {
    const [areaData, setAreaData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mostFrequent, setMostFrequent] = useState(null);

    useEffect(() => {
        fetchClaimsAndGenerateStats();
    }, []);

    const fetchClaimsAndGenerateStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/agent/claims');
            const claims = response.data.claims || [];

            // Process claims to group by area
            const areaMap = new Map();

            claims.forEach(claim => {
                // Try to get a meaningful area name from address
                const address = claim.reportId?.location?.address || 'Unknown Location';
                // Simple heuristic: Use the city/locality (assuming format "Street, City, State")
                // If address is short, use it as is. If long, try to split.
                let areaName = address;
                if (address.includes(',')) {
                    const parts = address.split(',').map(p => p.trim());
                    // Take the second to last part if available (often City), or just the first part
                    if (parts.length >= 2) {
                        areaName = parts[parts.length - 2] || parts[0];
                        // If it's too short (e.g. state code), maybe take the one before
                        if (areaName.length < 3 && parts.length >= 3) {
                            areaName = parts[parts.length - 3];
                        }
                    }
                }

                // Fallback if extraction fails or is empty
                if (!areaName || areaName === 'Unknown Location') {
                    // Try coordinates if address is missing
                    const loc = claim.reportId?.location;
                    if (loc?.latitude && loc?.longitude) {
                        areaName = `Loc: ${loc.latitude.toFixed(2)}, ${loc.longitude.toFixed(2)}`;
                    } else {
                        areaName = 'Unknown Area';
                    }
                }

                if (!areaMap.has(areaName)) {
                    areaMap.set(areaName, {
                        name: areaName,
                        count: 0,
                        severity: { severe: 0, moderate: 0, minor: 0 }
                    });
                }

                const area = areaMap.get(areaName);
                area.count++;

                const severity = claim.reportId?.prediction?.severity || 'minor';
                if (area.severity[severity] !== undefined) {
                    area.severity[severity]++;
                }
            });

            // Convert to array and sort by count descending
            const sortedAreas = Array.from(areaMap.values())
                .sort((a, b) => b.count - a.count)
                .slice(0, 10); // Top 10 areas

            setAreaData(sortedAreas);

            if (sortedAreas.length > 0) {
                setMostFrequent(sortedAreas[0]);
            }

        } catch (err) {
            console.error('Error fetching hotspots:', err);
            setError('Failed to load area data');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#ef4444', '#f97316', '#22c55e', '#3b82f6', '#8b5cf6'];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Analyzing area data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-gray-900 to-red-700 dark:from-white dark:to-red-400 bg-clip-text text-transparent">
                            Area Analysis
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-light">
                            Statistical breakdown of accidents by location
                        </p>
                    </div>
                </div>

                {mostFrequent && (
                    <div className="card rounded-3xl p-6 border border-red-200 dark:border-red-800 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 shadow-lg">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-800/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-red-800 dark:text-red-200">High Risk Zone: {mostFrequent.name}</h3>
                                <p className="text-red-700 dark:text-red-300 mt-1">
                                    {mostFrequent.count} accidents recorded in this area
                                </p>
                                <div className="flex space-x-4 mt-2 text-sm">
                                    <span className="text-red-600 font-semibold">Severe: {mostFrequent.severity.severe}</span>
                                    <span className="text-orange-600 font-semibold">Moderate: {mostFrequent.severity.moderate}</span>
                                    <span className="text-green-600 font-semibold">Minor: {mostFrequent.severity.minor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary-500" />
                            Top Accident Prone Areas
                        </h3>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={areaData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#374151" opacity={0.1} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#ef4444"
                                        radius={[0, 4, 4, 0]}
                                        name="Accidents"
                                        activeBar={({ x, y, width, height, fill }) => (
                                            <rect
                                                x={x}
                                                y={y}
                                                width={width}
                                                height={height}
                                                fill={fill}
                                                rx={4}
                                                ry={4}
                                                style={{ filter: 'drop-shadow(0 0 8px ' + fill + ')' }}
                                            />
                                        )}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {mostFrequent && (
                        <div className="card rounded-3xl p-6 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                                <AlertCircle className="w-5 h-5 mr-2 text-primary-500" />
                                Severity Distribution ({mostFrequent.name})
                            </h3>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Severe', value: mostFrequent.severity.severe },
                                                { name: 'Moderate', value: mostFrequent.severity.moderate },
                                                { name: 'Minor', value: mostFrequent.severity.minor }
                                            ].filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {[
                                                { name: 'Severe', color: '#ef4444' },
                                                { name: 'Moderate', color: '#f97316' },
                                                { name: 'Minor', color: '#22c55e' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                        />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AgentHotspots;
