export const mockEvents = [
  {
    id: 1,
    title: "Summer Music Festival",
    description: "An amazing music festival featuring the best artists",
    location: "City Park",
    owner_name: "Ahmed Mohammed",
    event_date: "2024-07-15",
    start_time: "19:00",
    end_time: "23:00",
    images: ["https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"]
  },
  {
    id: 2,
    title: "Art Exhibition",
    description: "Contemporary art exhibition showcasing modern masterpieces",
    location: "National Museum",
    owner_name: "Sarah Ahmed",
    event_date: "2024-06-20",
    start_time: "10:00",
    end_time: "18:00",
    images: ["https://images.unsplash.com/photo-1536924940846-cafafa43ce23?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"]
  },
  {
    id: 3,
    title: "Programming Workshop",
    description: "Web development workshop for beginners and intermediate developers",
    location: "Innovation Center",
    owner_name: "Mohammed Ali",
    event_date: "2024-05-25",
    start_time: "09:00",
    end_time: "16:00",
    images: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"]
  },
  {
    id: 4,
    title: "Charity Gala",
    description: "Annual charity event supporting humanitarian causes",
    location: "Grand Hotel",
    owner_name: "Fatima Hassan",
    event_date: "2024-08-10",
    start_time: "18:30",
    end_time: "22:30",
    images: ["https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"]
  },
  {
    id: 5,
    title: "Community Cleanup",
    description: "Join us in keeping our city clean and beautiful",
    location: "Downtown",
    owner_name: "Community Center",
    event_date: "2024-06-05",
    start_time: "08:00",
    end_time: "12:00",
    images: ["https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"]
  }
];

// Function to add a new event
export const addNewEvent = (newEvent) => {
  const newId = mockEvents.length + 1;
  const eventToAdd = {
    id: newId,
    ...newEvent,
    images: newEvent.images.map(file => URL.createObjectURL(file))
  };
  mockEvents.push(eventToAdd);
  return eventToAdd;
}; 