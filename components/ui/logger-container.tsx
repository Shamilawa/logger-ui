"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Search,
    Filter,
    Play,
    Pause,
    Download,
    Settings,
    ChevronDown,
    ChevronRight,
    AlertCircle,
    CheckCircle,
    XCircle,
    Info,
    Database,
    Zap,
    Moon,
    Sun,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
    id: string;
    timestamp: Date;
    level: "info" | "warning" | "error" | "success";
    category: "token_usage" | "storage" | "workflow" | "system";
    message: string;
    details?: {
        tokens?: { input: number; output: number; total: number };
        storage?: { used: string; limit: string; percentage: number };
        workflow?: { id: string; step: string; duration: number };
        error?: { code: string; stack: string };
    };
    source?: string;
}

const mockLogs: LogEntry[] = [
    {
        id: "1",
        timestamp: new Date(Date.now() - 1000),
        level: "info",
        category: "token_usage",
        message: "Token consumption recorded for workflow execution",
        details: {
            tokens: { input: 1250, output: 890, total: 2140 },
        },
        source: "workflow-engine",
    },
    {
        id: "2",
        timestamp: new Date(Date.now() - 5000),
        level: "warning",
        category: "storage",
        message: "Storage usage approaching limit",
        details: {
            storage: { used: "8.7 GB", limit: "10 GB", percentage: 87 },
        },
        source: "storage-monitor",
    },
    {
        id: "3",
        timestamp: new Date(Date.now() - 10000),
        level: "error",
        category: "workflow",
        message: "Workflow execution failed at step 3",
        details: {
            workflow: {
                id: "wf-12345",
                step: "data-processing",
                duration: 45000,
            },
            error: {
                code: "TIMEOUT_ERROR",
                stack: "Error: Request timeout after 45s\n  at WorkflowEngine.execute\n  at async processStep",
            },
        },
        source: "workflow-engine",
    },
    {
        id: "4",
        timestamp: new Date(Date.now() - 15000),
        level: "success",
        category: "workflow",
        message: "Workflow completed successfully",
        details: {
            workflow: { id: "wf-12344", step: "completion", duration: 12000 },
        },
        source: "workflow-engine",
    },
];

export default function LoggingConsole() {
    const [logs, setLogs] = useState<LogEntry[]>(mockLogs);
    const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>(mockLogs);
    const [isStreaming, setIsStreaming] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<string>("timestamp");
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [isDarkMode, setIsDarkMode] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Simulate real-time log streaming
    useEffect(() => {
        if (!isStreaming) return;

        const interval = setInterval(() => {
            const newLog: LogEntry = {
                id: Date.now().toString(),
                timestamp: new Date(),
                level: ["info", "warning", "error", "success"][
                    Math.floor(Math.random() * 4)
                ] as LogEntry["level"],
                category: ["token_usage", "storage", "workflow", "system"][
                    Math.floor(Math.random() * 4)
                ] as LogEntry["category"],
                message: [
                    "New workflow initiated",
                    "Token limit check completed",
                    "Storage cleanup process started",
                    "System health check passed",
                    "API rate limit warning",
                    "Database connection established",
                ][Math.floor(Math.random() * 6)],
                source: [
                    "workflow-engine",
                    "token-service",
                    "storage-monitor",
                    "system",
                ][Math.floor(Math.random() * 4)],
            };

            setLogs((prev) => [newLog, ...prev].slice(0, 1000)); // Keep only last 1000 logs
        }, 2000);

        return () => clearInterval(interval);
    }, [isStreaming]);

    // Filter and search logs
    useEffect(() => {
        let filtered = logs;

        if (searchQuery) {
            filtered = filtered.filter(
                (log) =>
                    log.message
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    log.source
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }

        if (levelFilter !== "all") {
            filtered = filtered.filter((log) => log.level === levelFilter);
        }

        if (categoryFilter !== "all") {
            filtered = filtered.filter(
                (log) => log.category === categoryFilter
            );
        }

        // Sort logs
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "timestamp":
                    return b.timestamp.getTime() - a.timestamp.getTime();
                case "level":
                    const levelOrder = {
                        error: 0,
                        warning: 1,
                        info: 2,
                        success: 3,
                    };
                    return levelOrder[a.level] - levelOrder[b.level];
                case "category":
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });

        setFilteredLogs(filtered);
    }, [logs, searchQuery, levelFilter, categoryFilter, sortBy]);

    // Auto-scroll to bottom when streaming
    useEffect(() => {
        if (isStreaming) {
            logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [filteredLogs, isStreaming]);

    const toggleLogExpansion = (logId: string) => {
        setExpandedLogs((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(logId)) {
                newSet.delete(logId);
            } else {
                newSet.add(logId);
            }
            return newSet;
        });
    };

    const getLevelIcon = (level: LogEntry["level"]) => {
        switch (level) {
            case "error":
                return <XCircle className="w-4 h-4 text-red-500" />;
            case "warning":
                return <AlertCircle className="w-4 h-4 text-amber-500" />;
            case "success":
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const getCategoryIcon = (category: LogEntry["category"]) => {
        switch (category) {
            case "token_usage":
                return <Zap className="w-4 h-4" />;
            case "storage":
                return <Database className="w-4 h-4" />;
            case "workflow":
                return <Settings className="w-4 h-4" />;
            default:
                return <Info className="w-4 h-4" />;
        }
    };

    const formatTimestamp = (timestamp: Date) => {
        return timestamp.toLocaleTimeString("en-US", {
            hour12: false,
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            fractionalSecondDigits: 3,
        });
    };

    return (
        <div
            className={cn(
                "min-h-screen transition-colors duration-200",
                isDarkMode ? "dark bg-gray-900" : "bg-gray-50"
            )}
        >
            <div className="flex h-screen">
                {/* Left Sidebar */}
                <div
                    className={cn(
                        "w-80 border-r flex flex-col",
                        isDarkMode
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                    )}
                >
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Logs Explorer
                            </h1>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="h-8 w-8"
                            >
                                {isDarkMode ? (
                                    <Sun className="w-4 h-4" />
                                ) : (
                                    <Moon className="w-4 h-4" />
                                )}
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="p-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Log Level
                            </label>
                            <Select
                                value={levelFilter}
                                onValueChange={setLevelFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Levels
                                    </SelectItem>
                                    <SelectItem value="error">Error</SelectItem>
                                    <SelectItem value="warning">
                                        Warning
                                    </SelectItem>
                                    <SelectItem value="info">Info</SelectItem>
                                    <SelectItem value="success">
                                        Success
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Category
                            </label>
                            <Select
                                value={categoryFilter}
                                onValueChange={setCategoryFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Categories
                                    </SelectItem>
                                    <SelectItem value="token_usage">
                                        Token Usage
                                    </SelectItem>
                                    <SelectItem value="storage">
                                        Storage
                                    </SelectItem>
                                    <SelectItem value="workflow">
                                        Workflow
                                    </SelectItem>
                                    <SelectItem value="system">
                                        System
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                Sort By
                            </label>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="timestamp">
                                        Timestamp
                                    </SelectItem>
                                    <SelectItem value="level">
                                        Severity
                                    </SelectItem>
                                    <SelectItem value="category">
                                        Category
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Total Logs:
                                </span>
                                <span className="font-mono text-gray-900 dark:text-white">
                                    {filteredLogs.length}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Errors:
                                </span>
                                <span className="font-mono text-red-600">
                                    {
                                        filteredLogs.filter(
                                            (l) => l.level === "error"
                                        ).length
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">
                                    Warnings:
                                </span>
                                <span className="font-mono text-amber-600">
                                    {
                                        filteredLogs.filter(
                                            (l) => l.level === "warning"
                                        ).length
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div
                        className={cn(
                            "p-4 border-b flex items-center justify-between",
                            isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                        )}
                    >
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={
                                    isStreaming ? "destructive" : "default"
                                }
                                size="sm"
                                onClick={() => setIsStreaming(!isStreaming)}
                                className="flex items-center space-x-2"
                            >
                                {isStreaming ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                                <span>
                                    {isStreaming ? "Stop" : "Start"} Streaming
                                </span>
                            </Button>

                            {isStreaming && (
                                <Badge
                                    variant="secondary"
                                    className="animate-pulse"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                    Live
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Advanced Filters
                            </Button>
                        </div>
                    </div>

                    {/* Logs Display */}
                    <div
                        className={cn(
                            "flex-1 overflow-auto font-mono text-sm",
                            isDarkMode ? "bg-gray-900" : "bg-gray-50"
                        )}
                    >
                        <div className="p-4 space-y-1">
                            {filteredLogs.map((log) => (
                                <Card
                                    key={log.id}
                                    className={cn(
                                        "p-0 border-l-4 transition-colors",
                                        log.level === "error"
                                            ? "border-l-red-500"
                                            : log.level === "warning"
                                            ? "border-l-amber-500"
                                            : log.level === "success"
                                            ? "border-l-green-500"
                                            : "border-l-blue-500",
                                        isDarkMode
                                            ? "bg-gray-800 border-gray-700"
                                            : "bg-white"
                                    )}
                                >
                                    <div
                                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        onClick={() =>
                                            toggleLogExpansion(log.id)
                                        }
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="flex items-center space-x-2 min-w-0">
                                                {expandedLogs.has(log.id) ? (
                                                    <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                )}
                                                {getLevelIcon(log.level)}
                                                {getCategoryIcon(log.category)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-3 mb-1">
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                        {formatTimestamp(
                                                            log.timestamp
                                                        )}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {log.category.replace(
                                                            "_",
                                                            " "
                                                        )}
                                                    </Badge>
                                                    {log.source && (
                                                        <span className="text-gray-400 text-xs">
                                                            {log.source}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-gray-900 dark:text-white">
                                                    {log.message}
                                                </div>
                                            </div>
                                        </div>

                                        {expandedLogs.has(log.id) &&
                                            log.details && (
                                                <div className="mt-3 pl-9 border-t border-gray-200 dark:border-gray-600 pt-3">
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded p-3 text-xs">
                                                        {log.details.tokens && (
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-gray-700 dark:text-gray-300">
                                                                    Token Usage:
                                                                </div>
                                                                <div>
                                                                    Input:{" "}
                                                                    {log.details.tokens.input.toLocaleString()}
                                                                </div>
                                                                <div>
                                                                    Output:{" "}
                                                                    {log.details.tokens.output.toLocaleString()}
                                                                </div>
                                                                <div>
                                                                    Total:{" "}
                                                                    {log.details.tokens.total.toLocaleString()}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {log.details
                                                            .storage && (
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-gray-700 dark:text-gray-300">
                                                                    Storage
                                                                    Info:
                                                                </div>
                                                                <div>
                                                                    Used:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .storage
                                                                            .used
                                                                    }
                                                                </div>
                                                                <div>
                                                                    Limit:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .storage
                                                                            .limit
                                                                    }
                                                                </div>
                                                                <div>
                                                                    Usage:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .storage
                                                                            .percentage
                                                                    }
                                                                    %
                                                                </div>
                                                            </div>
                                                        )}

                                                        {log.details
                                                            .workflow && (
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-gray-700 dark:text-gray-300">
                                                                    Workflow
                                                                    Details:
                                                                </div>
                                                                <div>
                                                                    ID:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .workflow
                                                                            .id
                                                                    }
                                                                </div>
                                                                <div>
                                                                    Step:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .workflow
                                                                            .step
                                                                    }
                                                                </div>
                                                                <div>
                                                                    Duration:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .workflow
                                                                            .duration
                                                                    }
                                                                    ms
                                                                </div>
                                                            </div>
                                                        )}

                                                        {log.details.error && (
                                                            <div className="space-y-1">
                                                                <div className="font-semibold text-red-600 dark:text-red-400">
                                                                    Error
                                                                    Details:
                                                                </div>
                                                                <div>
                                                                    Code:{" "}
                                                                    {
                                                                        log
                                                                            .details
                                                                            .error
                                                                            .code
                                                                    }
                                                                </div>
                                                                <div className="whitespace-pre-wrap text-red-600 dark:text-red-400">
                                                                    {
                                                                        log
                                                                            .details
                                                                            .error
                                                                            .stack
                                                                    }
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </Card>
                            ))}
                            <div ref={logsEndRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
