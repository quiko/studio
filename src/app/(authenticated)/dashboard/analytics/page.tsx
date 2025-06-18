
"use client";

import React, { useState } from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Progress,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui'; // Assuming components/ui/index.ts exports all necessary shadcn components
import {
  Filter,
  Download,
  Users,
  Calendar as CalendarIconLucide, // Renamed to avoid conflict with Calendar component
  MapPin,
  Clock,
  Palette,
  TrendingUp,
  ListMusic,
  Smartphone,
  Globe,
  BarChart2,
  PieChart as PieChartIcon,
  Speaker,
  Podcast,
  Users2,
  Heart,
  Eye,
  Languages,
  Map // Added Map icon
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  Sector, // For active shape in PieChart (Donut)
} from 'recharts';
import Image from 'next/image';
import TourPlanningAssistant from '@/components/analytics/TourPlanningAssistant'; // Import the new component

// Chart Data (as provided in the prompt)
const ageData = [ { name: "13-17", value: 5 }, { name: "18-24", value: 35 }, { name: "25-34", value: 40 }, { name: "35-44", value: 15 }, { name: "45-54", value: 3 }, { name: "55+", value: 2 }, ];
const genderData = [ { name: "Male", value: 58, color: "hsl(var(--chart-1))" }, { name: "Female", value: 39, color: "hsl(var(--chart-2))" }, { name: "Non-binary", value: 3, color: "hsl(var(--chart-3))" }, ];
const locationData = [ { name: "United States", value: 45 }, { name: "United Kingdom", value: 12 }, { name: "Germany", value: 8 }, { name: "Canada", value: 7 }, { name: "Australia", value: 6 }, { name: "France", value: 5 }, { name: "Brazil", value: 4 }, { name: "Japan", value: 3 }, { name: "Other", value: 10 }, ];
const deviceData = [ { name: "Mobile", value: 65, color: "hsl(var(--chart-1))" }, { name: "Desktop", value: 25, color: "hsl(var(--chart-2))" }, { name: "Tablet", value: 7, color: "hsl(var(--chart-3))" }, { name: "Smart Speaker", value: 3, color: "hsl(var(--chart-4))" }, ];
const listenerGrowthData = [ { month: "Jan", spotify: 1200, apple: 900, youtube: 1700, tiktok: 2400 }, { month: "Feb", spotify: 1900, apple: 1200, youtube: 1500, tiktok: 3100 }, { month: "Mar", spotify: 2100, apple: 1400, youtube: 1900, tiktok: 3800 }, { month: "Apr", spotify: 2400, apple: 1600, youtube: 2200, tiktok: 4200 }, { month: "May", spotify: 2200, apple: 1800, youtube: 2400, tiktok: 4800 }, { month: "Jun", spotify: 2600, apple: 2100, youtube: 2700, tiktok: 5200 }, ];
const engagementByTimeData = [ { hour: "00:00", listeners: 120 }, { hour: "03:00", listeners: 80 }, { hour: "06:00", listeners: 150 }, { hour: "09:00", listeners: 350 }, { hour: "12:00", listeners: 420 }, { hour: "15:00", listeners: 380 }, { hour: "18:00", listeners: 450 }, { hour: "21:00", listeners: 280 }, ];
const cityData = [ { name: "New York", value: 12 }, { name: "Los Angeles", value: 8 }, { name: "London", value: 7 }, { name: "Chicago", value: 5 }, { name: "Toronto", value: 4 }, { name: "Berlin", value: 4 }, { name: "Sydney", value: 3 }, { name: "Paris", value: 3 }, { name: "Tokyo", value: 2 }, { name: "Other", value: 52 }, ];
const languageData = [ { name: "English", value: 65, color: "hsl(var(--chart-1))" }, { name: "Spanish", value: 12, color: "hsl(var(--chart-2))" }, { name: "German", value: 8, color: "hsl(var(--chart-3))" }, { name: "French", value: 6, color: "hsl(var(--chart-4))" }, { name: "Portuguese", value: 5, color: "hsl(var(--chart-5))" }, { name: "Other", value: 4, color: "hsl(var(--muted))" }, ];
const seasonalData = [ { month: "Jan", listeners: 8200 }, { month: "Feb", listeners: 8800 }, { month: "Mar", listeners: 9600 }, { month: "Apr", listeners: 10300 }, { month: "May", listeners: 11200 }, { month: "Jun", listeners: 12100 }, { month: "Jul", listeners: 12800 }, { month: "Aug", listeners: 13500 }, { month: "Sep", listeners: 12900 }, { month: "Oct", listeners: 12200 }, { month: "Nov", listeners: 11500 }, { month: "Dec", listeners: 10800 }, ];

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--muted))",
];

const platformColors: { [key: string]: string } = {
  spotify: "hsl(var(--chart-1))",
  apple: "hsl(var(--chart-2))",
  youtube: "hsl(var(--chart-3))",
  tiktok: "hsl(var(--chart-4))",
};

// Helper for Donut chart active shape
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-headline text-lg">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="text-xs">{`${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))" className="text-xs">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


interface PlatformAgeData {
  platform: string;
  percentage: number;
  color: string;
}
interface AgeGroupPlatformDetail {
  ageGroup: string;
  platforms: PlatformAgeData[];
}
const detailedAgeData: AgeGroupPlatformDetail[] = [
    { ageGroup: "18-24", platforms: [{platform: "Spotify", percentage: 45, color: platformColors.spotify}, {platform: "Apple", percentage: 30, color: platformColors.apple}, {platform: "YouTube", percentage: 25, color: platformColors.youtube}]},
    { ageGroup: "25-34", platforms: [{platform: "Spotify", percentage: 50, color: platformColors.spotify}, {platform: "Apple", percentage: 25, color: platformColors.apple}, {platform: "YouTube", percentage: 25, color: platformColors.youtube}]},
    { ageGroup: "35-44", platforms: [{platform: "Spotify", percentage: 35, color: platformColors.spotify}, {platform: "Apple", percentage: 35, color: platformColors.apple}, {platform: "YouTube", percentage: 30, color: platformColors.youtube}]},
    { ageGroup: "45+", platforms: [{platform: "Spotify", percentage: 30, color: platformColors.spotify}, {platform: "Apple", percentage: 40, color: platformColors.apple}, {platform: "YouTube", percentage: 30, color: platformColors.youtube}]},
];

const audienceInterests = {
  genres: ["Pop", "R&B", "Indie Pop", "Electronic", "Chillwave"],
  similarArtists: [
    { name: "Artist A", image: "https://placehold.co/80x80.png", hint: "musician portrait" },
    { name: "Artist B", image: "https://placehold.co/80x80.png", hint: "band photo" },
    { name: "Artist C", image: "https://placehold.co/80x80.png", hint: "singer profile" },
    { name: "Artist D", image: "https://placehold.co/80x80.png", hint: "dj setup" },
  ]
};

const regionalGrowthData = [
  { region: "North America", growth: 15, color: "hsl(var(--chart-1))" },
  { region: "Europe", growth: 12, color: "hsl(var(--chart-2))" },
  { region: "Asia Pacific", growth: 22, color: "hsl(var(--chart-3))" },
  { region: "Latin America", growth: 18, color: "hsl(var(--chart-4))" },
  { region: "Middle East & Africa", growth: 8, color: "hsl(var(--chart-5))" },
];

const engagementMetricsData = [
  { metric: "Average Listen Time", value: 75, unit: "mins" },
  { metric: "Completion Rate", value: 60, unit: "%" },
  { metric: "Skip Rate", value: 15, unit: "%" },
  { metric: "Shares per Listener", value: 25, unit: "" }, // Value here is more like index
];
const contentPreferencesData = [
  { type: "Singles", value: 60 },
  { type: "Albums", value: 25 },
  { type: "Live Performances", value: 10 },
  { type: "Remixes", value: 5 },
];
const emergingMarketsData = [
  { market: "Brazil", growth: 25, color: "hsl(var(--chart-1))" },
  { market: "India", growth: 30, color: "hsl(var(--chart-2))" },
  { market: "Indonesia", growth: 22, color: "hsl(var(--chart-3))" },
  { market: "Mexico", growth: 18, color: "hsl(var(--chart-4))" },
];
const audiencePredictions = {
  projections: [
    { period: "Next 3 Months", growth: "+15%", listeners: "143.6K" },
    { period: "Next 6 Months", growth: "+28%", listeners: "160K" },
    { period: "Next 12 Months", growth: "+45%", listeners: "181K" },
  ],
  emergingSegments: ["Gen Z / Lo-fi Enthusiasts", "Spanish Speaking / Indie Folk", "Gaming Community / Electronic"]
};


export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("last90days");
  const [platform, setPlatform] = useState("all");
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-headline font-semibold">Audience Analytics</h1>
          <p className="text-muted-foreground">Understand who your listeners and followers are</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="last12months">Last 12 months</SelectItem>
              <SelectItem value="alltime">All time</SelectItem>
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="spotify">Spotify</SelectItem>
              <SelectItem value="apple">Apple Music</SelectItem>
              <SelectItem value="youtube">YouTube</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="Filter">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" aria-label="Download Report">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">124,892</div>
            <p className="text-xs text-muted-foreground">Across all connected platforms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Age Group</CardTitle>
            <CalendarIconLucide className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">25-34</div>
            <p className="text-xs text-muted-foreground">40% of your audience</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Location</CardTitle>
            <MapPin className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">United States</div>
            <p className="text-xs text-muted-foreground">45% of your audience</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peak Listening Time</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">18:00 - 21:00</div>
            <p className="text-xs text-muted-foreground">UTC time zone</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="geography">Geography</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="tour-planning">
            <Map className="mr-2 h-4 w-4" />
            Tour Planning
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Users2 className="mr-2 h-5 w-5 text-primary" />Age Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ageData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Bar dataKey="value" name="Audience Count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" />Gender Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><Globe className="mr-2 h-5 w-5 text-primary" />Top Locations</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => `${value}%`}/>
                  <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Audience Growth</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={listenerGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                  <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
                  <Line type="monotone" dataKey="spotify" name="Spotify" stroke={platformColors.spotify} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="apple" name="Apple Music" stroke={platformColors.apple} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="youtube" name="YouTube" stroke={platformColors.youtube} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="tiktok" name="TikTok" stroke={platformColors.tiktok} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />Detailed Age Breakdown</CardTitle>
                <CardDescription>Distribution by platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {detailedAgeData.map(group => (
                  <div key={group.ageGroup}>
                    <h4 className="text-sm font-medium mb-1">{group.ageGroup}</h4>
                    <div className="space-y-1">
                    {group.platforms.map(platform => (
                      <div key={platform.platform}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span>{platform.platform}</span>
                          <span>{platform.percentage}%</span>
                        </div>
                        <Progress value={platform.percentage} className="h-2" style={{ backgroundColor: platform.color + '33', '--progress-indicator-color': platform.color } as React.CSSProperties} />
                      </div>
                    ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><PieChartIcon className="mr-2 h-5 w-5 text-primary" />Gender Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      activeIndex={activeIndex}
                      activeShape={renderActiveShape}
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      dataKey="value"
                      onMouseEnter={onPieEnter}
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                     <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Smartphone className="mr-2 h-5 w-5 text-primary" />Device Usage</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deviceData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => `${value}%`}/>
                    <Bar dataKey="value" name="Usage Percentage" radius={[4, 4, 0, 0]}>
                        {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Audience Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Top Genres</h4>
                  <div className="flex flex-wrap gap-2">
                    {audienceInterests.genres.map(genre => <Badge key={genre} variant="secondary">{genre}</Badge>)}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-2">Similar Artists They Follow</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {audienceInterests.similarArtists.map(artist => (
                      <div key={artist.name} className="flex flex-col items-center text-center">
                        <Avatar className="h-16 w-16 mb-1">
                          <AvatarImage src={artist.image} alt={artist.name} data-ai-hint={artist.hint} />
                          <AvatarFallback>{artist.name.substring(0,1)}</AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground">{artist.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Geography Tab */}
        <TabsContent value="geography" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Globe className="mr-2 h-5 w-5 text-primary" />Top Countries</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={locationData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} width={100} interval={0}/>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => `${value}%`}/>
                    <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Top Cities</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cityData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} width={80} interval={0}/>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} formatter={(value: number) => `${value}%`}/>
                    <Bar dataKey="value" name="Percentage" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} barSize={15} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Regional Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {regionalGrowthData.map(region => (
                  <div key={region.region}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{region.region}</span>
                      <span style={{color: region.color}}>+{region.growth}%</span>
                    </div>
                    <Progress value={region.growth * 2} className="h-2" style={{'--progress-indicator-color': region.color } as React.CSSProperties} /> {/* Multiply for better visual */}
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Languages className="mr-2 h-5 w-5 text-primary" />Language Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={languageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Behavior Tab */}
        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Listening Time Slots</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementByTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }}/>
                    <Bar dataKey="listeners" name="Active Listeners" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Smartphone className="mr-2 h-5 w-5 text-primary" />Device Usage</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><Eye className="mr-2 h-5 w-5 text-primary" />Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {engagementMetricsData.map(item => (
                  <div key={item.metric}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.metric}</span>
                      <span className="font-semibold" style={{color: COLORS[engagementMetricsData.indexOf(item) % COLORS.length]}}>{item.metric === "Average Listen Time" ? `${Math.round(item.value/100 * 120)}${item.unit}` : `${item.value}${item.unit}`}</span>
                    </div>
                    <Progress value={item.value} className="h-2" style={{'--progress-indicator-color': COLORS[engagementMetricsData.indexOf(item) % COLORS.length] } as React.CSSProperties} />
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><ListMusic className="mr-2 h-5 w-5 text-primary" />Content Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                 {contentPreferencesData.map(item => (
                  <div key={item.type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.type}</span>
                       <span className="font-semibold" style={{color: COLORS[contentPreferencesData.indexOf(item) % COLORS.length]}}>{item.value}%</span>
                    </div>
                    <Progress value={item.value} className="h-2" style={{'--progress-indicator-color': COLORS[contentPreferencesData.indexOf(item) % COLORS.length] } as React.CSSProperties} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Audience Growth Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={listenerGrowthData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }} />
                    <Line type="monotone" dataKey="spotify" name="Spotify" stroke={platformColors.spotify} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="apple" name="Apple Music" stroke={platformColors.apple} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="youtube" name="YouTube" stroke={platformColors.youtube} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="tiktok" name="TikTok" stroke={platformColors.tiktok} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><MapPin className="mr-2 h-5 w-5 text-primary" />Emerging Markets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {emergingMarketsData.map(item => (
                  <div key={item.market}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.market}</span>
                      <span className="font-semibold" style={{color: item.color}}>+{item.growth}% YoY</span>
                    </div>
                    <Progress value={item.growth * 2.5} className="h-2" style={{'--progress-indicator-color': item.color } as React.CSSProperties} /> {/* Scale for visual */}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><CalendarIconLucide className="mr-2 h-5 w-5 text-primary" />Seasonal Trends</CardTitle>
                <CardDescription>Monthly listener evolution over the year</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={seasonalData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
                    <Line type="monotone" dataKey="listeners" name="Total Listeners" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Audience Predictions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-4">
                  {audiencePredictions.projections.map(proj => (
                    <div key={proj.period} className="flex justify-between items-baseline p-2 bg-muted/30 rounded-md">
                      <span className="text-sm">{proj.period}:</span>
                      <div className="text-right">
                        <span className="font-semibold text-green-500">{proj.growth}</span>
                        <span className="text-xs text-muted-foreground ml-1">({proj.listeners})</span>
                      </div>
                    </div>
                  ))}
                </div>
                 <h4 className="text-sm font-semibold mb-2">Emerging Audience Segments:</h4>
                 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    {audiencePredictions.emergingSegments.map(segment => <li key={segment}>{segment}</li>)}
                 </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        {/* Tour Planning Tab Content */}
        <TabsContent value="tour-planning" className="mt-6">
          <TourPlanningAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}
