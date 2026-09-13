#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <commctrl.h>
#include <shellapi.h>
#include <shlobj.h>
#include <stdio.h>
#include <wchar.h>

#define APP_TITLE L"VN Revival Languages for Stardew Valley"
#define WM_INSTALL_FINISHED (WM_APP + 1)
#define ID_RETRY 1001
#define ID_CHOOSE 1002
#define ID_LAUNCH 1003

static HWND statusLabel;
static HWND progressBar;
static HWND retryButton;
static HWND chooseButton;
static HWND launchButton;
static HFONT uiFont;
static HFONT titleFont;
static volatile LONG installationRunning;
static WCHAR applicationDirectory[MAX_PATH * 4];
static WCHAR selectedGamePath[MAX_PATH * 4];
static WCHAR statusFile[MAX_PATH * 4];

static void setControlFont(HWND control) {
    SendMessageW(control, WM_SETFONT, (WPARAM)uiFont, TRUE);
}

static void showInstallingState(void) {
    SetWindowTextW(statusLabel, L"Installing SMAPI, Content Patcher, and all VN Revival languages…");
    ShowWindow(progressBar, SW_SHOW);
    SendMessageW(progressBar, PBM_SETMARQUEE, TRUE, 35);
    ShowWindow(retryButton, SW_HIDE);
    ShowWindow(chooseButton, SW_HIDE);
    ShowWindow(launchButton, SW_HIDE);
}

static void showFailureState(const WCHAR *message) {
    SetWindowTextW(statusLabel, message && message[0] ? message : L"Installation did not finish. Check your internet connection and try again.");
    SendMessageW(progressBar, PBM_SETMARQUEE, FALSE, 0);
    ShowWindow(progressBar, SW_HIDE);
    ShowWindow(retryButton, SW_SHOW);
    ShowWindow(chooseButton, SW_SHOW);
    ShowWindow(launchButton, SW_HIDE);
}

static void showSuccessState(void) {
    SetWindowTextW(statusLabel, L"All translations installed");
    SendMessageW(progressBar, PBM_SETMARQUEE, FALSE, 0);
    ShowWindow(progressBar, SW_HIDE);
    ShowWindow(retryButton, SW_HIDE);
    ShowWindow(chooseButton, SW_HIDE);
    ShowWindow(launchButton, SW_SHOW);
}

static BOOL readStatusMessage(WCHAR *destination, DWORD capacity) {
    HANDLE file = CreateFileW(statusFile, GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE, NULL, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, NULL);
    if (file == INVALID_HANDLE_VALUE) return FALSE;

    char buffer[4096];
    DWORD bytesRead = 0;
    BOOL read = ReadFile(file, buffer, sizeof(buffer) - 1, &bytesRead, NULL);
    CloseHandle(file);
    if (!read || bytesRead == 0) return FALSE;
    buffer[bytesRead] = '\0';

    int converted = MultiByteToWideChar(CP_UTF8, 0, buffer, -1, destination, (int)capacity);
    return converted > 0;
}

static DWORD WINAPI installWorker(LPVOID parameter) {
    HWND window = (HWND)parameter;
    WCHAR scriptPath[MAX_PATH * 4];
    WCHAR commandLine[MAX_PATH * 12];
    WCHAR systemDirectory[MAX_PATH];
    WCHAR powershellPath[MAX_PATH * 2];

    swprintf(scriptPath, _countof(scriptPath), L"%ls\\Resources\\install.ps1", applicationDirectory);
    GetSystemDirectoryW(systemDirectory, _countof(systemDirectory));
    swprintf(powershellPath, _countof(powershellPath), L"%ls\\WindowsPowerShell\\v1.0\\powershell.exe", systemDirectory);

    if (selectedGamePath[0]) {
        swprintf(
            commandLine,
            _countof(commandLine),
            L"\"%ls\" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"%ls\" -BaseDirectory \"%ls\" -StatusFile \"%ls\" -GamePath \"%ls\"",
            powershellPath,
            scriptPath,
            applicationDirectory,
            statusFile,
            selectedGamePath
        );
    } else {
        swprintf(
            commandLine,
            _countof(commandLine),
            L"\"%ls\" -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File \"%ls\" -BaseDirectory \"%ls\" -StatusFile \"%ls\"",
            powershellPath,
            scriptPath,
            applicationDirectory,
            statusFile
        );
    }

    DeleteFileW(statusFile);
    STARTUPINFOW startup = {0};
    PROCESS_INFORMATION process = {0};
    startup.cb = sizeof(startup);
    BOOL started = CreateProcessW(
        powershellPath,
        commandLine,
        NULL,
        NULL,
        FALSE,
        CREATE_NO_WINDOW,
        NULL,
        applicationDirectory,
        &startup,
        &process
    );

    DWORD exitCode = 1;
    if (started) {
        WaitForSingleObject(process.hProcess, INFINITE);
        GetExitCodeProcess(process.hProcess, &exitCode);
        CloseHandle(process.hThread);
        CloseHandle(process.hProcess);
    } else {
        FILE *status = _wfopen(statusFile, L"wb");
        if (status) {
            fputs("Windows PowerShell could not be started.", status);
            fclose(status);
        }
    }

    InterlockedExchange(&installationRunning, 0);
    PostMessageW(window, WM_INSTALL_FINISHED, (WPARAM)exitCode, 0);
    return 0;
}

static void startInstallation(HWND window) {
    if (InterlockedCompareExchange(&installationRunning, 1, 0) != 0) return;
    showInstallingState();
    HANDLE thread = CreateThread(NULL, 0, installWorker, window, 0, NULL);
    if (!thread) {
        InterlockedExchange(&installationRunning, 0);
        showFailureState(L"The installer worker could not be started.");
        return;
    }
    CloseHandle(thread);
}

static BOOL chooseGameFolder(HWND owner) {
    BROWSEINFOW browse = {0};
    browse.hwndOwner = owner;
    browse.lpszTitle = L"Choose the Stardew Valley folder";
    browse.ulFlags = BIF_RETURNONLYFSDIRS | BIF_NEWDIALOGSTYLE;
    PIDLIST_ABSOLUTE item = SHBrowseForFolderW(&browse);
    if (!item) return FALSE;
    BOOL resolved = SHGetPathFromIDListW(item, selectedGamePath);
    CoTaskMemFree(item);
    return resolved;
}

static LRESULT CALLBACK windowProcedure(HWND window, UINT message, WPARAM wParam, LPARAM lParam) {
    (void)lParam;
    switch (message) {
        case WM_CREATE: {
            uiFont = CreateFontW(-18, 0, 0, 0, FW_NORMAL, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH, L"Segoe UI");
            HWND title = CreateWindowW(L"STATIC", APP_TITLE, WS_CHILD | WS_VISIBLE,
                36, 30, 520, 36, window, NULL, NULL, NULL);
            titleFont = CreateFontW(-25, 0, 0, 0, FW_SEMIBOLD, FALSE, FALSE, FALSE, DEFAULT_CHARSET,
                OUT_DEFAULT_PRECIS, CLIP_DEFAULT_PRECIS, CLEARTYPE_QUALITY, DEFAULT_PITCH, L"Segoe UI");
            SendMessageW(title, WM_SETFONT, (WPARAM)titleFont, TRUE);

            statusLabel = CreateWindowW(L"STATIC", L"Preparing installation…", WS_CHILD | WS_VISIBLE,
                38, 88, 500, 58, window, NULL, NULL, NULL);
            progressBar = CreateWindowW(PROGRESS_CLASSW, NULL, WS_CHILD | WS_VISIBLE | PBS_MARQUEE,
                38, 151, 500, 12, window, NULL, NULL, NULL);
            retryButton = CreateWindowW(L"BUTTON", L"Retry", WS_CHILD | BS_PUSHBUTTON,
                38, 185, 132, 38, window, (HMENU)ID_RETRY, NULL, NULL);
            chooseButton = CreateWindowW(L"BUTTON", L"Choose game…", WS_CHILD | BS_PUSHBUTTON,
                182, 185, 160, 38, window, (HMENU)ID_CHOOSE, NULL, NULL);
            launchButton = CreateWindowW(L"BUTTON", L"Launch game", WS_CHILD | BS_DEFPUSHBUTTON,
                38, 185, 180, 40, window, (HMENU)ID_LAUNCH, NULL, NULL);
            HWND hint = CreateWindowW(L"STATIC", L"This may take a few minutes", WS_CHILD | WS_VISIBLE,
                38, 236, 500, 26, window, NULL, NULL, NULL);

            setControlFont(statusLabel);
            setControlFont(retryButton);
            setControlFont(chooseButton);
            setControlFont(launchButton);
            setControlFont(hint);
            PostMessageW(window, WM_APP, 0, 0);
            return 0;
        }
        case WM_APP:
            startInstallation(window);
            return 0;
        case WM_INSTALL_FINISHED: {
            DWORD exitCode = (DWORD)wParam;
            if (exitCode == 0) {
                showSuccessState();
            } else {
                WCHAR details[2048] = {0};
                if (!readStatusMessage(details, _countof(details)) && exitCode == 2) {
                    wcscpy(details, L"Stardew Valley was not found. Choose the game folder.");
                }
                showFailureState(details);
            }
            return 0;
        }
        case WM_COMMAND:
            switch (LOWORD(wParam)) {
                case ID_RETRY:
                    startInstallation(window);
                    return 0;
                case ID_CHOOSE:
                    if (chooseGameFolder(window)) startInstallation(window);
                    return 0;
                case ID_LAUNCH:
                    if ((INT_PTR)ShellExecuteW(window, L"open", L"steam://rungameid/413150", NULL, NULL, SW_SHOWNORMAL) <= 32) {
                        showFailureState(L"Steam could not be opened. Launch Stardew Valley from your Steam library.");
                    } else {
                        DestroyWindow(window);
                    }
                    return 0;
            }
            break;
        case WM_CLOSE:
            if (InterlockedCompareExchange(&installationRunning, 0, 0) != 0) {
                MessageBoxW(window, L"Installation is still in progress.", APP_TITLE, MB_OK | MB_ICONINFORMATION);
                return 0;
            }
            DestroyWindow(window);
            return 0;
        case WM_DESTROY:
            if (uiFont) DeleteObject(uiFont);
            if (titleFont) DeleteObject(titleFont);
            DeleteFileW(statusFile);
            PostQuitMessage(0);
            return 0;
    }
    return DefWindowProcW(window, message, wParam, lParam);
}

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE previous, PWSTR commandLine, int showCommand) {
    (void)previous;
    (void)commandLine;

    INITCOMMONCONTROLSEX controls = {sizeof(controls), ICC_PROGRESS_CLASS};
    InitCommonControlsEx(&controls);
    CoInitializeEx(NULL, COINIT_APARTMENTTHREADED);

    WCHAR executablePath[MAX_PATH * 4];
    DWORD length = GetModuleFileNameW(NULL, executablePath, _countof(executablePath));
    if (length == 0 || length >= _countof(executablePath)) return 1;
    WCHAR *separator = wcsrchr(executablePath, L'\\');
    if (!separator) return 1;
    *separator = L'\0';
    wcscpy(applicationDirectory, executablePath);

    WCHAR temporaryDirectory[MAX_PATH * 2];
    GetTempPathW(_countof(temporaryDirectory), temporaryDirectory);
    swprintf(statusFile, _countof(statusFile), L"%lsVNRevival-Stardew-Installer-%lu.txt", temporaryDirectory, GetCurrentProcessId());

    WNDCLASSEXW windowClass = {0};
    windowClass.cbSize = sizeof(windowClass);
    windowClass.lpfnWndProc = windowProcedure;
    windowClass.hInstance = instance;
    windowClass.hIcon = LoadIconW(instance, MAKEINTRESOURCEW(1));
    windowClass.hIconSm = windowClass.hIcon;
    windowClass.hCursor = LoadCursorW(NULL, IDC_ARROW);
    windowClass.hbrBackground = (HBRUSH)(COLOR_WINDOW + 1);
    windowClass.lpszClassName = L"VNRevivalStardewInstallerWindow";
    if (!RegisterClassExW(&windowClass)) return 1;

    const int width = 590;
    const int height = 330;
    RECT desktop;
    SystemParametersInfoW(SPI_GETWORKAREA, 0, &desktop, 0);
    int x = desktop.left + (desktop.right - desktop.left - width) / 2;
    int y = desktop.top + (desktop.bottom - desktop.top - height) / 2;
    HWND window = CreateWindowExW(
        0,
        windowClass.lpszClassName,
        APP_TITLE,
        WS_OVERLAPPED | WS_CAPTION | WS_SYSMENU | WS_MINIMIZEBOX,
        x,
        y,
        width,
        height,
        NULL,
        NULL,
        instance,
        NULL
    );
    if (!window) return 1;

    ShowWindow(window, showCommand);
    UpdateWindow(window);
    MSG message;
    while (GetMessageW(&message, NULL, 0, 0) > 0) {
        TranslateMessage(&message);
        DispatchMessageW(&message);
    }
    CoUninitialize();
    return (int)message.wParam;
}
