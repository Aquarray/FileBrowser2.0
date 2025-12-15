# 📁 File Browser

A modern, full-stack, highly scalable file browsing application with a sleek React frontend and a robust .NET Core backend. Browse, manage, and stream files with real-time updates powered by SignalR.

## ✨ Features

- **📂 File & Folder Navigation**: Browse your file system with an intuitive interface
- **🔍 Real-Time Updates**: Live folder content updates using SignalR
- **⚡ Fast File Streaming**: Efficient file download with range request support
- **🎨 Modern UI**: Beautiful React interface with smooth animations
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **🗄️ MongoDB Integration**: Persistent file metadata storage
- **🔐 Secure API**: RESTful API with proper authentication support
- **🎯 SignalR Hub**: Real-time push notifications for folder changes

## 🏗️ Architecture

### Frontend (React + Vite)
- **Location**: `FileBrowser.Client/`
- **Stack**: React 18, React Router v7, Tailwind CSS, Vite
- **Features**: 
  - Dynamic file browsing with real-time updates
  - Smooth animations with Framer Motion
  - SVG icons with Lucide React
  - SignalR client integration

### Backend (.NET 8)
- **Location**: `FileBrowser.Server/`
- **Stack**: ASP.NET Core 8, MongoDB, SignalR
- **Features**:
  - RESTful API for file operations
  - SignalR hub for real-time communication
  - MongoDB service for metadata storage
  - Comprehensive caching with ConcurrentCacheDict
  - Swagger/OpenAPI documentation

## 📋 Prerequisites

- **Node.js** 18+ (for frontend development)
- **.NET 8 SDK** (for backend development)
- **MongoDB** (local or remote instance)
- **npm** or **yarn** (package manager)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/file-browser.git
cd file-browser
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd FileBrowser.Server
```

Configure MongoDB connection in `appsettings.json`:

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "FileBrowser"
  },
  "Configs": {
    "RootPath": "/your/file/path"
  }
}
```

Restore dependencies and run:

```bash
dotnet restore
dotnet build
dotnet run
```

The backend will be available at `https://localhost:5001` (or configured port)

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd FileBrowser.Client
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173` (or next available port)

### 4. Running Together

To run both services together, open the solution in Visual Studio:

```bash
# From the root directory
FileBrowser.sln
```

Press `F5` to start debugging both the backend and frontend simultaneously.

## 📖 Project Structure

```
file-browser/
├── FileBrowser.Server/          # Backend (.NET Core)
│   ├── Controllers/             # API endpoints
│   ├── Services/                # Business logic (MongoDB, ReadFolder)
│   ├── SingalRHubs/             # SignalR hub for real-time updates
│   ├── DTOs/                    # Data Transfer Objects
│   ├── Modals/                  # Data models
│   ├── Program.cs               # Application startup
│   └── appsettings.json         # Configuration
│
├── FileBrowser.Client/          # Frontend (React)
│   ├── src/
│   │   ├── Componenets/         # React components
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # Entry point with SignalR context
│   │   ├── App.css              # Styles
│   │   └── index.css            # Global styles
│   ├── index.html               # HTML template
│   ├── package.json             # Dependencies
│   ├── vite.config.js           # Vite configuration
│   └── tailwind.config.js       # Tailwind CSS configuration
│
└── FileBrowser.sln              # Solution file
```

## 🔌 API Endpoints

### Stream Controller

#### GET `/api/stream/{id}`
Download a file by its MongoDB ObjectId.

**Parameters:**
- `id` (path): MongoDB ObjectId of the file

**Response:** File stream with range request support

**Example:**
```bash
curl -X GET https://localhost:5001/api/stream/507f1f77bcf86cd799439011 \
  -H "Accept: application/octet-stream"
```

## 🔄 SignalR Hub

### FolderItemHub

Real-time communication for folder updates.

**Connection Endpoint:** `/details`

**Supported Methods:**
- `GetFolderItems(path)`: Get items in a folder
- `SubscribeFolderChanges(path)`: Subscribe to folder changes

**Events:**
- `FolderContentUpdated`: Emitted when folder contents change
- `FileAdded`: Emitted when a new file is added
- `FileRemoved`: Emitted when a file is removed

## 🛠️ Configuration

### Backend Configuration (`appsettings.json`)

```json
{
  "MongoDB": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "FileBrowser"
  },
  "Configs": {
    "RootPath": "/path/to/browse"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### Frontend Configuration

Environment variables in `FileBrowser.Client/.env`:

```env
VITE_API_URL=https://localhost:5001
VITE_SIGNALR_URL=https://localhost:5001/details
```

## 📦 Dependencies

### Backend
- **MongoDB.Driver**: MongoDB client library
- **Microsoft.AspNetCore.SpaProxy**: SPA proxy middleware
- **Swashbuckle.AspNetCore**: Swagger/OpenAPI implementation

### Frontend
- **react**: UI library
- **react-router-dom**: Client-side routing
- **@microsoft/signalr**: SignalR client library
- **motion**: Animation library
- **tailwindcss**: CSS utility framework
- **lucide-react**: Icon library

## 🧪 Development

### Running Tests

Backend tests:
```bash
cd FileBrowser.Server
dotnet test
```

Frontend tests:
```bash
cd FileBrowser.Client
npm run test
```

### Linting

Frontend linting:
```bash
cd FileBrowser.Client
npm run lint
```

## 🏗️ Building for Production

### Backend Build

```bash
cd FileBrowser.Server
dotnet publish -c Release -o ./publish
```

### Frontend Build

```bash
cd FileBrowser.Client
npm run build
```

The production build will be output to `dist/` directory.

## 🐛 Troubleshooting

### Port Already in Use
If port 5001 or 5173 is already in use, configure alternative ports:

**Backend**: Modify `launchSettings.json` in `Properties/`
**Frontend**: Use `npm run dev -- --port 3000`

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `appsettings.json`
- Verify firewall rules for MongoDB port (27017)

### CORS Errors
- Check `Program.cs` CORS policy configuration
- Update allowed origins in `WithOrigins()`
- Ensure frontend URL matches configuration

### SignalR Connection Errors
- Verify both backend and frontend are running
- Check network connectivity
- Review browser console for detailed error messages

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

For support, email yuyutshuparashar@gmail.com or open an issue on GitHub.

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] File upload functionality
- [ ] Search and filtering capabilities
- [ ] Thumbnail previews for images
- [ ] Dark mode support
- [ ] Compression support (ZIP/TAR)
- [ ] File metadata display
- [ ] Advanced permission management
- [ ] Activity logging and audit trail

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [ASP.NET Core](https://dotnet.microsoft.com/en-us/apps/aspnet)
- [MongoDB](https://www.mongodb.com/)
- [SignalR](https://learn.microsoft.com/en-us/aspnet/signalr/introduction)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Made with ❤️ by the Aquarray**
