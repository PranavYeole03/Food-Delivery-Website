import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    socket.on("identity", async ({ userId, role }) => {
      if (!userId) return;
      try {
        // Join a room unique to the user
        socket.join(userId);
        
        // Join a room for the specific role (e.g., 'owner', 'deliveryBoy', 'user')
        if (role) {
          socket.join(role);
        }

        await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true },
        );
      } catch (error) {
        console.error("Socket identity error:", error);
      }
    });

    // New standardized event
    socket.on("delivery:update-location", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });
        if (user) {
          io.emit("delivery:location-update", {
            deliveryBoyId: userId,
            latitude,
            longitude,
          });
        }
      } catch (error) {
        console.error("Socket update location error:", error);
      }
    });

    // Old event for backward compatibility if needed temporarily
    socket.on("updateLocation", async ({ latitude, longitude, userId }) => {
      try {
        const user = await User.findByIdAndUpdate(userId, {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        });
        if (user) {
          io.emit("delivery:location-update", {
            deliveryBoyId: userId,
            latitude,
            longitude,
          });
        }
      } catch (error) {
        console.error("Socket update location error:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            socketId: null,
            isOnline: false,
          },
        );
      } catch (error) {
        console.error("Socket disconnect error:", error);
      }
    });
  });
};
