// import { ArrowDown, ArrowUp } from "lucide-react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
// import { Line, LineChart, ResponsiveContainer } from "recharts"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
// import { useState } from "react"
//
// const merchantsData = [
//   {
//     name: "TechStore Inc",
//     global: {
//       revenueTotal: "$125,430",
//       revenueChange24hr: 12.5,
//       revenueData: [
//         { value: 100 },
//         { value: 120 },
//         { value: 115 },
//         { value: 130 },
//         { value: 125 },
//         { value: 135 },
//         { value: 112.5 },
//       ],
//       successRate: 98.5,
//       successRateChange24hr: 2.3,
//       successRateData: [
//         { value: 96 },
//         { value: 97 },
//         { value: 96.5 },
//         { value: 97.5 },
//         { value: 98 },
//         { value: 97.8 },
//         { value: 98.5 },
//       ],
//     },
//     chile: {
//       revenueTotal: "$45,230",
//       revenueChange24hr: 8.2,
//       revenueData: [
//         { value: 100 },
//         { value: 105 },
//         { value: 103 },
//         { value: 108 },
//         { value: 107 },
//         { value: 109 },
//         { value: 108.2 },
//       ],
//       successRate: 97.2,
//       successRateChange24hr: 1.5,
//       successRateData: [
//         { value: 95.5 },
//         { value: 96 },
//         { value: 96.2 },
//         { value: 96.8 },
//         { value: 97 },
//         { value: 97.1 },
//         { value: 97.2 },
//       ],
//     },
//     peru: {
//       revenueTotal: "$38,120",
//       revenueChange24hr: 15.8,
//       revenueData: [
//         { value: 85 },
//         { value: 90 },
//         { value: 95 },
//         { value: 100 },
//         { value: 108 },
//         { value: 112 },
//         { value: 115.8 },
//       ],
//       successRate: 96.8,
//       successRateChange24hr: 3.1,
//       successRateData: [
//         { value: 93.5 },
//         { value: 94.2 },
//         { value: 95 },
//         { value: 95.8 },
//         { value: 96.2 },
//         { value: 96.5 },
//         { value: 96.8 },
//       ],
//     },
//     mexico: {
//       revenueTotal: "$42,080",
//       revenueChange24hr: 10.3,
//       revenueData: [
//         { value: 95 },
//         { value: 98 },
//         { value: 100 },
//         { value: 103 },
//         { value: 105 },
//         { value: 108 },
//         { value: 110.3 },
//       ],
//       successRate: 98.1,
//       successRateChange24hr: 1.8,
//       successRateData: [
//         { value: 96 },
//         { value: 96.5 },
//         { value: 97 },
//         { value: 97.5 },
//         { value: 97.8 },
//         { value: 98 },
//         { value: 98.1 },
//       ],
//     },
//   },
//   {
//     name: "Fashion Forward",
//     global: {
//       revenueTotal: "$89,250",
//       revenueChange24hr: -5.2,
//       revenueData: [
//         { value: 120 },
//         { value: 115 },
//         { value: 110 },
//         { value: 105 },
//         { value: 100 },
//         { value: 95 },
//         { value: 94.8 },
//       ],
//       successRate: 95.2,
//       successRateChange24hr: -1.5,
//       successRateData: [
//         { value: 97 },
//         { value: 96.5 },
//         { value: 96 },
//         { value: 95.8 },
//         { value: 95.5 },
//         { value: 95.3 },
//         { value: 95.2 },
//       ],
//     },
//     chile: {
//       revenueTotal: "$28,450",
//       revenueChange24hr: -3.8,
//       revenueData: [
//         { value: 110 },
//         { value: 108 },
//         { value: 105 },
//         { value: 102 },
//         { value: 100 },
//         { value: 98 },
//         { value: 96.2 },
//       ],
//       successRate: 94.5,
//       successRateChange24hr: -2.1,
//       successRateData: [
//         { value: 97 },
//         { value: 96.5 },
//         { value: 96 },
//         { value: 95.5 },
//         { value: 95 },
//         { value: 94.7 },
//         { value: 94.5 },
//       ],
//     },
//     peru: {
//       revenueTotal: "$32,180",
//       revenueChange24hr: -6.5,
//       revenueData: [
//         { value: 115 },
//         { value: 110 },
//         { value: 105 },
//         { value: 100 },
//         { value: 98 },
//         { value: 95 },
//         { value: 93.5 },
//       ],
//       successRate: 93.8,
//       successRateChange24hr: -1.8,
//       successRateData: [
//         { value: 96 },
//         { value: 95.5 },
//         { value: 95 },
//         { value: 94.5 },
//         { value: 94.2 },
//         { value: 94 },
//         { value: 93.8 },
//       ],
//     },
//     mexico: {
//       revenueTotal: "$28,620",
//       revenueChange24hr: -4.9,
//       revenueData: [
//         { value: 112 },
//         { value: 108 },
//         { value: 105 },
//         { value: 102 },
//         { value: 100 },
//         { value: 97 },
//         { value: 95.1 },
//       ],
//       successRate: 95.8,
//       successRateChange24hr: -0.9,
//       successRateData: [
//         { value: 97 },
//         { value: 96.8 },
//         { value: 96.5 },
//         { value: 96.2 },
//         { value: 96 },
//         { value: 95.9 },
//         { value: 95.8 },
//       ],
//     },
//   },
//   {
//     name: "Global Gadgets",
//     global: {
//       revenueTotal: "$203,890",
//       revenueChange24hr: 8.7,
//       revenueData: [
//         { value: 100 },
//         { value: 102 },
//         { value: 103 },
//         { value: 105 },
//         { value: 106 },
//         { value: 107 },
//         { value: 108.7 },
//       ],
//       successRate: 99.1,
//       successRateChange24hr: 0.5,
//       successRateData: [
//         { value: 98.5 },
//         { value: 98.6 },
//         { value: 98.7 },
//         { value: 98.9 },
//         { value: 99 },
//         { value: 99.1 },
//         { value: 99.1 },
//       ],
//     },
//     chile: {
//       revenueTotal: "$72,340",
//       revenueChange24hr: 12.3,
//       revenueData: [
//         { value: 95 },
//         { value: 98 },
//         { value: 100 },
//         { value: 105 },
//         { value: 108 },
//         { value: 110 },
//         { value: 112.3 },
//       ],
//       successRate: 98.8,
//       successRateChange24hr: 0.8,
//       successRateData: [
//         { value: 98 },
//         { value: 98.2 },
//         { value: 98.3 },
//         { value: 98.5 },
//         { value: 98.6 },
//         { value: 98.7 },
//         { value: 98.8 },
//       ],
//     },
//     peru: {
//       revenueTotal: "$65,880",
//       revenueChange24hr: 6.4,
//       revenueData: [
//         { value: 100 },
//         { value: 101 },
//         { value: 102 },
//         { value: 103 },
//         { value: 104 },
//         { value: 105 },
//         { value: 106.4 },
//       ],
//       successRate: 99.3,
//       successRateChange24hr: 0.3,
//       successRateData: [
//         { value: 99 },
//         { value: 99.1 },
//         { value: 99.1 },
//         { value: 99.2 },
//         { value: 99.2 },
//         { value: 99.3 },
//         { value: 99.3 },
//       ],
//     },
//     mexico: {
//       revenueTotal: "$65,670",
//       revenueChange24hr: 7.9,
//       revenueData: [
//         { value: 98 },
//         { value: 100 },
//         { value: 102 },
//         { value: 104 },
//         { value: 105 },
//         { value: 107 },
//         { value: 107.9 },
//       ],
//       successRate: 99.0,
//       successRateChange24hr: 0.6,
//       successRateData: [
//         { value: 98.4 },
//         { value: 98.5 },
//         { value: 98.6 },
//         { value: 98.8 },
//         { value: 98.9 },
//         { value: 99 },
//         { value: 99 },
//       ],
//     },
//   },
//   {
//     name: "Home Essentials",
//     global: {
//       revenueTotal: "$67,120",
//       revenueChange24hr: 15.3,
//       revenueData: [
//         { value: 80 },
//         { value: 85 },
//         { value: 90 },
//         { value: 95 },
//         { value: 100 },
//         { value: 110 },
//         { value: 115.3 },
//       ],
//       successRate: 97.8,
//       successRateChange24hr: 3.2,
//       successRateData: [
//         { value: 94 },
//         { value: 95 },
//         { value: 95.5 },
//         { value: 96 },
//         { value: 96.8 },
//         { value: 97.2 },
//         { value: 97.8 },
//       ],
//     },
//     chile: {
//       revenueTotal: "$22,350",
//       revenueChange24hr: 18.5,
//       revenueData: [
//         { value: 75 },
//         { value: 82 },
//         { value: 88 },
//         { value: 95 },
//         { value: 102 },
//         { value: 112 },
//         { value: 118.5 },
//       ],
//       successRate: 96.8,
//       successRateChange24hr: 4.1,
//       successRateData: [
//         { value: 92 },
//         { value: 93.5 },
//         { value: 94.5 },
//         { value: 95.5 },
//         { value: 96 },
//         { value: 96.5 },
//         { value: 96.8 },
//       ],
//     },
//     peru: {
//       revenueTotal: "$19,890",
//       revenueChange24hr: 13.2,
//       revenueData: [
//         { value: 82 },
//         { value: 87 },
//         { value: 92 },
//         { value: 97 },
//         { value: 102 },
//         { value: 108 },
//         { value: 113.2 },
//       ],
//       successRate: 98.2,
//       successRateChange24hr: 2.8,
//       successRateData: [
//         { value: 95 },
//         { value: 95.8 },
//         { value: 96.5 },
//         { value: 97 },
//         { value: 97.5 },
//         { value: 98 },
//         { value: 98.2 },
//       ],
//     },
//     mexico: {
//       revenueTotal: "$24,880",
//       revenueChange24hr: 14.6,
//       revenueData: [
//         { value: 78 },
//         { value: 84 },
//         { value: 90 },
//         { value: 96 },
//         { value: 102 },
//         { value: 110 },
//         { value: 114.6 },
//       ],
//       successRate: 97.5,
//       successRateChange24hr: 3.5,
//       successRateData: [
//         { value: 93.5 },
//         { value: 94.5 },
//         { value: 95.2 },
//         { value: 96 },
//         { value: 96.8 },
//         { value: 97.2 },
//         { value: 97.5 },
//       ],
//     },
//   },
//   {
//     name: "Sports Kingdom",
//     global: {
//       revenueTotal: "$156,780",
//       revenueChange24hr: -2.8,
//       revenueData: [
//         { value: 105 },
//         { value: 103 },
//         { value: 102 },
//         { value: 100 },
//         { value: 99 },
//         { value: 98 },
//         { value: 97.2 },
//       ],
//       successRate: 96.4,
//       successRateChange24hr: -0.8,
//       successRateData: [
//         { value: 97.5 },
//         { value: 97.3 },
//         { value: 97 },
//         { value: 96.8 },
//         { value: 96.6 },
//         { value: 96.5 },
//         { value: 96.4 },
//       ],
//     },
//     chile: {
//       revenueTotal: "$52,180",
//       revenueChange24hr: -1.5,
//       revenueData: [
//         { value: 103 },
//         { value: 102 },
//         { value: 101 },
//         { value: 100 },
//         { value: 99.5 },
//         { value: 99 },
//         { value: 98.5 },
//       ],
//       successRate: 97.1,
//       successRateChange24hr: -0.4,
//       successRateData: [
//         { value: 97.8 },
//         { value: 97.6 },
//         { value: 97.5 },
//         { value: 97.3 },
//         { value: 97.2 },
//         { value: 97.1 },
//         { value: 97.1 },
//       ],
//     },
//     peru: {
//       revenueTotal: "$48,920",
//       revenueChange24hr: -4.2,
//       revenueData: [
//         { value: 108 },
//         { value: 105 },
//         { value: 103 },
//         { value: 100 },
//         { value: 98 },
//         { value: 97 },
//         { value: 95.8 },
//       ],
//       successRate: 95.8,
//       successRateChange24hr: -1.2,
//       successRateData: [
//         { value: 97.5 },
//         { value: 97.2 },
//         { value: 96.8 },
//         { value: 96.5 },
//         { value: 96.2 },
//         { value: 96 },
//         { value: 95.8 },
//       ],
//     },
//     mexico: {
//       revenueTotal: "$55,680",
//       revenueChange24hr: -2.1,
//       revenueData: [
//         { value: 104 },
//         { value: 103 },
//         { value: 101 },
//         { value: 100 },
//         { value: 99 },
//         { value: 98.5 },
//         { value: 97.9 },
//       ],
//       successRate: 96.2,
//       successRateChange24hr: -0.9,
//       successRateData: [
//         { value: 97.5 },
//         { value: 97.3 },
//         { value: 97 },
//         { value: 96.8 },
//         { value: 96.5 },
//         { value: 96.3 },
//         { value: 96.2 },
//       ],
//     },
//   },
// ]
//
// function MerchantStatisticTable() {
//   const [selectedCountry, setSelectedCountry] = useState<"global" | "chile" | "peru" | "mexico">("global")
//   return (
//     <div className="w-full">
//       <Card>
//         <CardHeader>
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <CardTitle>Merchant Tracking</CardTitle>
//               <CardDescription>Real-time performance metrics and revenue tracking across all merchants</CardDescription>
//             </div>
//             <Select value={selectedCountry} onValueChange={(value: any) => setSelectedCountry(value)}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select country" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="global">Global</SelectItem>
//                 <SelectItem value="chile">Chile</SelectItem>
//                 <SelectItem value="peru">Peru</SelectItem>
//                 <SelectItem value="mexico">Mexico</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Merchant Name</TableHead>
//                 <TableHead className="text-right">Revenue Total</TableHead>
//                 <TableHead>Revenue Change (24h)</TableHead>
//                 <TableHead className="text-right">Success Rate</TableHead>
//                 <TableHead>Success Rate Change (24h)</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {merchantsData.map((merchant) => {
//                 const data = merchant[selectedCountry]
//                 const isRevenuePositive = data.revenueChange24hr >= 0
//                 const isSuccessRatePositive = data.successRateChange24hr >= 0
//
//                 return (
//                   <TableRow key={merchant.name}>
//                     <TableCell className="font-medium">{merchant.name}</TableCell>
//                     <TableCell className="text-right font-semibold">{data.revenueTotal}</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <SparklineChart
//                           data={data.revenueData}
//                           color={isRevenuePositive ? "#22c55e" : "#ef4444"}
//                           isPositive={isRevenuePositive}
//                         />
//                         <div className="flex items-center gap-1">
//                           {isRevenuePositive ? (
//                             <ArrowUp className="h-4 w-4 text-green-600" />
//                           ) : (
//                             <ArrowDown className="h-4 w-4 text-red-600" />
//                           )}
//                           <span
//                             className={`text-sm font-medium ${isRevenuePositive ? "text-green-600" : "text-red-600"}`}
//                           >
//                             {Math.abs(data.revenueChange24hr)}%
//                           </span>
//                         </div>
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-right font-semibold">{data.successRate}%</TableCell>
//                     <TableCell>
//                       <div className="flex items-center gap-2">
//                         <SparklineChart
//                           data={data.successRateData}
//                           color={isSuccessRatePositive ? "#22c55e" : "#ef4444"}
//                           isPositive={isSuccessRatePositive}
//                         />
//                         <div className="flex items-center gap-1">
//                           {isSuccessRatePositive ? (
//                             <ArrowUp className="h-4 w-4 text-green-600" />
//                           ) : (
//                             <ArrowDown className="h-4 w-4 text-red-600" />
//                           )}
//                           <span
//                             className={`text-sm font-medium ${isSuccessRatePositive ? "text-green-600" : "text-red-600"
//                               }`}
//                           >
//                             {Math.abs(data.successRateChange24hr)}%
//                           </span>
//                         </div>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 )
//               })}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
//
// function SparklineChart({ data, color, isPositive }: { data: any[]; color: string; isPositive: boolean }) {
//   return (
//     <ResponsiveContainer width={80} height={32}>
//       <LineChart data={data}>
//         <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
//       </LineChart>
//     </ResponsiveContainer>
//   )
// }
//
// export default MerchantStatisticTable
