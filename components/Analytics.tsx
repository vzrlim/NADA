import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download, Filter } from "lucide-react";
import { useState } from "react";

const mockTimeSeriesData = [
  { time: '00:00', 'MY-001': 58, 'MY-002': 42, 'ID-001': 25 },
  { time: '04:00', 'MY-001': 62, 'MY-002': 38, 'ID-001': 22 },
  { time: '08:00', 'MY-001': 55, 'MY-002': 35, 'ID-001': 20 },
  { time: '12:00', 'MY-001': 48, 'MY-002': 32, 'ID-001': 18 },
  { time: '16:00', 'MY-001': 52, 'MY-002': 36, 'ID-001': 16 },
  { time: '20:00', 'MY-001': 65, 'MY-002': 40, 'ID-001': 19 },
];

const speciesData = [
  { species: 'Hylarana erythraea', calls: 45, percentage: 40 },
  { species: 'Fejervarya limnocharis', calls: 38, percentage: 35 },
  { species: 'Microhyla butleri', calls: 28, percentage: 25 },
];

const weeklyTrendData = [
  { day: 'Mon', calls: 52, quality: 'Good' },
  { day: 'Tue', calls: 48, quality: 'Good' },
  { day: 'Wed', calls: 45, quality: 'Warning' },
  { day: 'Thu', calls: 42, quality: 'Warning' },
  { day: 'Fri', calls: 38, quality: 'Warning' },
  { day: 'Sat', calls: 35, quality: 'Alert' },
  { day: 'Sun', calls: 32, quality: 'Alert' },
];

const pieData = [
  { name: 'Good', value: 1, color: '#22c55e' },
  { name: 'Warning', value: 1, color: '#f59e0b' },
  { name: 'Alert', value: 1, color: '#ef4444' },
];

export function Analytics() {
  const [timeRange, setTimeRange] = useState("24h");
  const [selectedPaddy, setSelectedPaddy] = useState("all");

  const handleExportData = () => {
    // Simulate data export
    const currentDate = new Date().toISOString().split('T')[0];
    const exportData = {
      exportDate: currentDate,
      timeRange: timeRange,
      selectedPaddy: selectedPaddy,
      data: {
        timeSeries: mockTimeSeriesData,
        species: speciesData,
        weeklyTrend: weeklyTrendData,
        qualityStatus: pieData
      }
    };
    
    // Create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nada-analytics-${currentDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Analytics data exported successfully for ${timeRange} time range!`);
  };

  const averageCalls = Math.round(mockTimeSeriesData.reduce((sum, item) => 
    sum + item['MY-001'] + item['MY-002'] + item['ID-001'], 0) / (mockTimeSeriesData.length * 3));

  const trendChange = 12; // Mock percentage change

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Analytics Dashboard</h2>
          <p className="text-sm text-muted-foreground">Historical data and trends analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Calls/Min</span>
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{averageCalls}</span>
              <Badge variant="outline" className="text-xs text-green-600">
                +{trendChange}%
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Peak Activity</span>
              <Calendar className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">20:00</span>
              <span className="text-sm text-muted-foreground">65 calls</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Species Diversity</span>
              <Filter className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">3</span>
              <span className="text-sm text-muted-foreground">identified</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Quality Alerts</span>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">2</span>
              <span className="text-sm text-muted-foreground">active</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Frog Call Activity Over Time</h3>
              <Select value={selectedPaddy} onValueChange={setSelectedPaddy}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Paddies</SelectItem>
                  <SelectItem value="MY-001">MY-001</SelectItem>
                  <SelectItem value="MY-002">MY-002</SelectItem>
                  <SelectItem value="ID-001">ID-001</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockTimeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="MY-001" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="MY-002" stroke="#f59e0b" strokeWidth={2} />
                <Line type="monotone" dataKey="ID-001" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Species Distribution */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Species Distribution</h3>
            
            <div className="space-y-3">
              {speciesData.map((species, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{species.species}</span>
                    <span className="text-sm text-muted-foreground">{species.calls} calls</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${species.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Weekly Trends */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Weekly Trend Analysis</h3>
            
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="calls" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Quality Status Distribution */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Water Quality Status</h3>
            
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm">{entry.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">1 paddy</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Environmental Correlations */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Environmental Correlations</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">Temperature Impact</h4>
              <p className="text-2xl font-bold text-blue-600">-0.72</p>
              <p className="text-xs text-muted-foreground">Correlation with call activity</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">pH Levels</h4>
              <p className="text-2xl font-bold text-green-600">+0.85</p>
              <p className="text-xs text-muted-foreground">Correlation with call activity</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm">Rainfall</h4>
              <p className="text-2xl font-bold text-purple-600">+0.43</p>
              <p className="text-xs text-muted-foreground">Correlation with call activity</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}