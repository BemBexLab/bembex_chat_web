import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let currentIdentity: { userId: string; userType: string } | null = null;

function identifySocket() {
	if (!socket || !socket.connected || !currentIdentity) return;
	socket.emit("identify", { id: currentIdentity.userId, type: currentIdentity.userType });
	console.log("[Socket] Sent identify event with userId:", currentIdentity.userId, "type:", currentIdentity.userType);
}

export function connectSocket(token: string, userId: string, userType: string) {
	console.log("[Socket] connectSocket called - current socket state:", socket?.connected ? "CONNECTED" : socket ? "DISCONNECTED" : "NULL");
	currentIdentity = { userId, userType };

	if (socket && socket.connected) {
		console.log("[Socket] Socket already connected, re-identifying current identity");
		identifySocket();
		return socket;
	}

	if (socket && !socket.connected) {
		console.log("[Socket] Socket was disconnected, attempting to reconnect...");
		socket.connect();
		return socket;
	}

	if (!socket) {
		console.log("[Socket] Creating NEW socket connection for user:", userId, "type:", userType);
		socket = io(typeof window !== "undefined" ? window.location.origin : "", {
			transports: ["websocket"],
			auth: { token },
			reconnection: true,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			reconnectionAttempts: 5,
			forceNew: false,
		});

		socket.on("connect", () => {
			console.log("[Socket] Connected! Socket ID:", socket?.id);
			identifySocket();
		});

		socket.on("disconnect", (reason) => {
			console.log("[Socket] Disconnected - Reason:", reason);
			console.log("[Socket] Will attempt to reconnect on next activity...");
		});

		socket.on("reconnect", () => {
			console.log("[Socket] Reconnected!");
			identifySocket();
		});

		socket.on("connect_error", (error) => {
			console.error("[Socket] Connection error:", error);
		});

		socket.on("user_suspended", async (data: any) => {
			console.log("[Socket] User suspended event received");
			try {
				await fetch("/api/user/logout", { method: "POST" });
			} catch {
				// ignore
			}

			try {
				localStorage.removeItem("auth");
			} catch {}
			try {
				localStorage.removeItem("admin_auth");
			} catch {}
			disconnectSocket();
			alert(data?.message || "Your account has been suspended");
			window.location.href = "/login";
		});

		socket.on("force_logout", async (data: any) => {
			console.log("[Socket] Force logout event received");
			try {
				await fetch("/api/user/logout", { method: "POST" });
			} catch {}
			try {
				localStorage.removeItem("auth");
			} catch {}
			try {
				localStorage.removeItem("admin_auth");
			} catch {}
			disconnectSocket();
			alert(data?.message || "You have been logged out by an administrator");
			window.location.href = "/login";
		});
	}

	return socket;
}

export function disconnectSocket() {
	if (socket) {
		console.log("[Socket] Forcing disconnect and cleanup");
		socket.disconnect();
		socket = null;
	}
	currentIdentity = null;
}

export function getSocket() {
	if (socket && !socket.connected) {
		console.log("[Socket] getSocket called but socket is disconnected. Attempting to reconnect...");
		socket.connect();
	}
	return socket;
}
