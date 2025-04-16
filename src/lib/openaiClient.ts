// src/lib/openaiClient.ts
// This is a mock implementation for frontend development

export const openai = {
  chat: {
    completions: {
      create: async ({ messages }: { messages: any[] }) => {
        console.log('Mock OpenAI API call with messages:', messages);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Extract location data from the prompt to create a more tailored response
        const promptContent = messages[0]?.content || '';
        let locations: string[] = [];

        try {
          // Try to extract location names from the prompt
          const locationMatch = promptContent.match(/Itinerary Overview: (.*?)(?:\\n|$)/);
          if (locationMatch && locationMatch[1]) {
            locations = locationMatch[1].split(', ').filter(Boolean);
          }
        } catch (error) {
          console.error('Error parsing locations:', error);
        }

        // Generate a generic travel log with the extracted locations
        const locationText = locations.length > 0
          ? generateMockTravelLogWithLocations(locations)
          : generateGenericMockTravelLog();

        return {
          choices: [{
            message: {
              content: locationText,
            },
          }],
        };
      },
    },
  },
};

function generateMockTravelLogWithLocations(locations: string[]): string {
  const intro = `# My Unforgettable Journey\\n\\nI recently had the opportunity to embark on an amazing adventure, exploring some truly remarkable places. This trip was a perfect blend of cultural experiences, natural beauty, and memorable moments.\\n\\n`;

  let bodyText = '';

  // Create paragraphs for each location
  locations.forEach((location, index) => {
    if (index === 0) {
      bodyText += `## Starting the Adventure: ${location}\\n\\nMy journey began in ${location}, where I was immediately struck by the unique atmosphere. The weather was perfect for exploration, and I spent the first day wandering through the streets, taking in the sights and sounds. `;
      bodyText += `The local cuisine was absolutely delightful, and I made sure to try the regional specialties.\\n\\n`;
    } else if (index === locations.length - 1) {
      bodyText += `## Final Stop: ${location}\\n\\nThe last part of my trip took me to ${location}. By this point, I had already collected so many wonderful memories, but ${location} still managed to surprise me. `;
      bodyText += `The views were breathtaking, and I found myself wishing I could stay longer. It was the perfect place to conclude my adventure.\\n\\n`;
    } else {
      bodyText += `## Exploring ${location}\\n\\nAfter a short journey, I arrived in ${location}. This place had been on my bucket list for quite some time, and it certainly didn't disappoint. `;
      bodyText += `I spent my time here visiting the major attractions, sampling the local delicacies, and chatting with friendly locals who shared fascinating stories about the area's history and culture.\\n\\n`;
    }
  });

  let conclusion = `## Reflections\\n\\nAs my journey came to an end, I couldn't help but feel grateful for all the experiences I had. Each place I visited offered something unique and special, contributing to what became an unforgettable adventure. `;
  conclusion += `The memories I've made during this trip will stay with me for a lifetime, and I'm already looking forward to planning my next adventure!\\n`;

  return intro + bodyText + conclusion;
}

function generateGenericMockTravelLog(): string {
  return `# My Amazing Travel Experience

## Beginning the Journey

I began my travel adventure with excitement and anticipation. After months of planning, it was finally time to set off and explore new horizons. The early morning departure had me groggy but filled with enthusiasm for what lay ahead.

## First Destination

My first stop was absolutely breathtaking. The scenic views were everything I had imagined and more. I spent my days exploring local attractions, trying authentic cuisine, and immersing myself in the culture. The locals were incredibly welcoming and eager to share stories about their hometown.

## Unexpected Discoveries

One of the highlights of my trip was stumbling upon a hidden gem that wasn't in any guidebook. This unexpected discovery turned out to be one of the most memorable parts of my journey. Sometimes the unplanned moments truly make a trip special.

## Cultural Experiences

Throughout my travels, I made it a point to participate in local customs and traditions. From attending a traditional ceremony to learning basic phrases in the local language, these experiences provided a deeper connection to the places I visited.

## Final Thoughts

As my journey came to an end, I found myself reflecting on all the amazing experiences I had. Travel truly broadens the mind and enriches the soul. I'm already looking forward to my next adventure, but for now, I'll cherish these memories and the perspectives they've given me.
`;
}
