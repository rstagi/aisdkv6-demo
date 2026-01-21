"use client";

interface SearchResult {
  type: "search-results";
  query: string;
  documents: Array<{
    id: number;
    title: string;
    content: string;
    relevance: number;
  }>;
}

interface WeatherResult {
  type: "weather";
  location: string;
  temperature: number;
  unit: string;
  condition: string;
  humidity: number;
  windSpeed: number;
  forecast: Array<{ day: string; temp: number }>;
}

interface StockResult {
  type: "stock-price";
  symbol: string;
  price: number;
  currency: string;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: string;
}

interface MemorySaved {
  type: "memory-saved";
  key: string;
  value: string;
  timestamp: string;
}

interface MemoryRecalled {
  type: "memory-recalled";
  found: boolean;
  key: string;
  value?: string;
}

interface MemoryList {
  type: "memory-list";
  memories: Array<{ key: string; value: string }>;
}

type ToolResult =
  | SearchResult
  | WeatherResult
  | StockResult
  | MemorySaved
  | MemoryRecalled
  | MemoryList;

export function SearchResultsCard({ data }: { data: SearchResult }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🔍</span>
        <span className="font-semibold text-blue-800">
          Search: &quot;{data.query}&quot;
        </span>
      </div>
      <div className="space-y-3">
        {data.documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg p-3 border border-blue-100"
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-medium text-gray-900">{doc.title}</h4>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {doc.relevance}% match
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{doc.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeatherCard({ data }: { data: WeatherResult }) {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case "sunny":
        return "☀️";
      case "cloudy":
        return "☁️";
      case "rainy":
        return "🌧️";
      case "partly cloudy":
        return "⛅";
      default:
        return "🌤️";
    }
  };

  return (
    <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border border-sky-200 rounded-xl p-4 my-2 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sky-800 text-lg">{data.location}</h3>
          <p className="text-sky-600 text-sm">{data.condition}</p>
        </div>
        <div className="text-4xl">{getWeatherIcon(data.condition)}</div>
      </div>
      <div className="flex items-end gap-4 mb-4">
        <span className="text-5xl font-bold text-sky-900">
          {data.temperature}
        </span>
        <span className="text-2xl text-sky-700 mb-1">{data.unit}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/60 rounded-lg p-2">
          <span className="text-xs text-sky-600">Humidity</span>
          <p className="font-semibold text-sky-800">{data.humidity}%</p>
        </div>
        <div className="bg-white/60 rounded-lg p-2">
          <span className="text-xs text-sky-600">Wind</span>
          <p className="font-semibold text-sky-800">{data.windSpeed} km/h</p>
        </div>
      </div>
      <div className="flex gap-2">
        {data.forecast.map((day) => (
          <div
            key={day.day}
            className="flex-1 bg-white/60 rounded-lg p-2 text-center"
          >
            <span className="text-xs text-sky-600">{day.day}</span>
            <p className="font-semibold text-sky-800">
              {day.temp}
              {data.unit}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StockCard({ data }: { data: StockResult }) {
  const isPositive = data.change >= 0;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 my-2 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📈</span>
          <h3 className="font-bold text-emerald-800 text-xl">{data.symbol}</h3>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-sm font-medium ${
            isPositive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {isPositive ? "+" : ""}
          {data.changePercent}%
        </span>
      </div>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-bold text-emerald-900">
          ${data.price.toFixed(2)}
        </span>
        <span
          className={`text-lg mb-1 ${
            isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {isPositive ? "+" : ""}
          {data.change.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/60 rounded-lg p-2">
          <span className="text-xs text-emerald-600">Volume</span>
          <p className="font-semibold text-emerald-800">
            {(data.volume / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="bg-white/60 rounded-lg p-2">
          <span className="text-xs text-emerald-600">Market Cap</span>
          <p className="font-semibold text-emerald-800">${data.marketCap}</p>
        </div>
      </div>
    </div>
  );
}

export function MemorySavedCard({ data }: { data: MemorySaved }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl p-3 my-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">💾</span>
        <span className="font-medium text-purple-800">Memory Saved</span>
      </div>
      <div className="mt-2 bg-white/60 rounded-lg p-2">
        <span className="text-xs text-purple-600">Key:</span>
        <span className="ml-2 font-mono text-purple-800">{data.key}</span>
        <div className="mt-1">
          <span className="text-xs text-purple-600">Value:</span>
          <p className="text-purple-800">{data.value}</p>
        </div>
      </div>
    </div>
  );
}

export function MemoryRecalledCard({ data }: { data: MemoryRecalled }) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 my-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">🧠</span>
        <span className="font-medium text-amber-800">
          Memory: {data.key}
        </span>
      </div>
      {data.found ? (
        <div className="mt-2 bg-white/60 rounded-lg p-2">
          <p className="text-amber-800">{data.value}</p>
        </div>
      ) : (
        <p className="mt-2 text-amber-600 italic">Not found</p>
      )}
    </div>
  );
}

export function MemoryListCard({ data }: { data: MemoryList }) {
  return (
    <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-3 my-2 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">📋</span>
        <span className="font-medium text-rose-800">All Memories</span>
      </div>
      {data.memories.length === 0 ? (
        <p className="text-rose-600 italic">No memories stored yet</p>
      ) : (
        <div className="space-y-2">
          {data.memories.map((m) => (
            <div key={m.key} className="bg-white/60 rounded-lg p-2">
              <span className="font-mono text-rose-700 text-sm">{m.key}:</span>
              <span className="ml-2 text-rose-800">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ToolResultRenderer({ result }: { result: unknown }) {
  const data = result as ToolResult;

  if (!data || typeof data !== "object" || !("type" in data)) {
    return (
      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  switch (data.type) {
    case "search-results":
      return <SearchResultsCard data={data} />;
    case "weather":
      return <WeatherCard data={data} />;
    case "stock-price":
      return <StockCard data={data} />;
    case "memory-saved":
      return <MemorySavedCard data={data} />;
    case "memory-recalled":
      return <MemoryRecalledCard data={data} />;
    case "memory-list":
      return <MemoryListCard data={data} />;
    default:
      return (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      );
  }
}
