# Plan: STI OTA Update Management System
Created: 2026-06-10T11:08:04+07:00
Status: 🟡 In Progress

## Overview
Hệ thống deploy phần mềm cho các ứng dụng trong hệ sinh thái của STI Vietnam. Hệ thống có admin dashboard để quản lý dự án, loại ứng dụng (android, windows, iot, agv,...), thiết bị được phép và các phiên bản cập nhật. Các thiết bị đầu cuối sẽ dùng các link API để kiểm tra cập nhật và tải xuống. Ứng dụng chạy chung một cổng (cả frontend và backend) và hỗ trợ build ra Windows/Linux.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Ant Design (antd)
- **Backend**: ASP.NET Core 8.0 Web API + Entity Framework Core
- **Database**: SQLite (dễ deploy, không cần cài server DBMS)
- **Deployment**: Chạy chung 1 port bằng cách serve React SPA trong `wwwroot` của .NET. Biên dịch thành self-contained ứng dụng độc lập trên Linux/Windows.

## Phases

| Phase | Name | Status | Progress |
|-------|------|--------|----------|
| 01 | Setup Environment | ✅ Complete | 100% |
| 02 | Database Schema | ✅ Complete | 100% |
| 03 | Backend API | ✅ Complete | 100% |
| 04 | Frontend UI | ✅ Complete | 100% |
| 05 | Integration | ✅ Complete | 100% |
| 06 | Testing & Deploy | ✅ Complete | 100% |

## Quick Commands
- Start Phase 1: `/code phase-01`
- Check progress: `/next`
- Save context: `/save-brain`
