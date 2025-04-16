// src/app/share/[shareId]/page.tsx
'use client';

import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import SharedTripView from './SharedTripView';

// This type mirrors what we expect to get from the database
interface TravelLog {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  coverImage: string;
  locations: string[];
  photoCount: number;
  tripDuration: string;
}

// Props for the dynamic page parameters
interface Props {
  params: { shareId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// Generate metadata for the page (for SEO and social sharing)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Fetch data for the travel log
  const travelLog = await getTravelLog(params.shareId);
  
  // If no travel log is found, we'll return minimal metadata
  if (!travelLog) {
    return {
      title: 'Travel Log Not Found',
      description: 'This travel log is either private or does not exist.'
    };
  }
  
  // Extract a description from the content (first non-header paragraph)
  const description = travelLog.content
    .split('\n')
    .find(line => line.trim() && !line.startsWith('#'))
    ?.slice(0, 160) || "View this travel log";
  
  return {
    title: travelLog.title,
    description,
    openGraph: {
      title: travelLog.title,
      description,
      images: [{
        url: travelLog.coverImage,
        width: 1200,
        height: 630,
        alt: travelLog.title,
      }],
      type: 'article',
      publishedTime: travelLog.date,
      authors: [travelLog.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: travelLog.title,
      description,
      images: [travelLog.coverImage],
      creator: travelLog.author,
    }
  };
}

// In a real app, this function would fetch data from the database
async function getTravelLog(shareId: string): Promise<TravelLog | null> {
  try {
    // In a real implementation, you'd query your database
    // const { data, error } = await supabase
    //   .from('trips')
    //   .select(`
    //     id, 
    //     shared_title as title, 
    //     user:user_id(display_name), 
    //     created_at,
    //     edited_text as content,
    //     shared_image_url as coverImage
    //   `)
    //   .eq('share_id', shareId)
    //   .eq('is_public', true)
    //   .single();

    // if (error || !data) return null;
    
    // For now, return mock data
    return getMockData(shareId);
  } catch (error) {
    console.error('Error fetching travel log:', error);
    return null;
  }
}

// Mock data function
function getMockData(shareId: string): TravelLog {
  return {
    id: shareId,
    title: "My Amazing Trip to Japan",
    author: "Travel Enthusiast",
    date: "April 15-30, 2023",
    locations: ["Tokyo", "Kyoto", "Osaka"],
    photoCount: 87,
    tripDuration: "15 days",
    coverImage: "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80",
    content: `
# My Amazing Trip to Japan

## Starting the Adventure in Tokyo

I began my journey in the vibrant city of Tokyo. The energy of this metropolis is unlike anything I've experienced before. From the neon lights of Shinjuku to the traditional temples of Asakusa, the contrast between old and new is fascinating.

The food was incredible - I tried everything from high-end sushi to street food. The ramen in a small shop near my hotel was particularly memorable; the rich broth and perfectly cooked noodles made for an unforgettable meal.

## Exploring Kyoto's Temples

After a few days in Tokyo, I took the bullet train to Kyoto. The efficiency of Japanese transportation is impressive! In Kyoto, I visited numerous temples and shrines. The golden pavilion (Kinkaku-ji) was stunning, especially with its reflection in the surrounding pond.

Walking through the bamboo grove in Arashiyama was like entering another world. The sound of bamboo stalks gently knocking against each other in the breeze created a natural symphony.

## Final Days in Osaka

My last stop was Osaka, known for its incredible food scene. Takoyaki (octopus balls) and okonomiyaki (savory pancakes) became my go-to snacks. The city has a more relaxed vibe compared to Tokyo, but is equally fascinating.

Osaka Castle was a highlight - learning about Japanese history while enjoying the beautiful park surroundings made for a perfect day.

## Reflections

This trip to Japan was truly life-changing. The culture, food, and people left a lasting impression on me. I'm already planning my next visit to explore more of this amazing country!
    `
  };
}

// This is the server component that fetches data
export default async function SharedLogPage({ params }: Props) {
  const travelLog = await getTravelLog(params.shareId);
  
  // If no travel log is found or it's not public, show 404
  if (!travelLog) {
    notFound();
  }
  
  // Pass the data to the client component
  return <SharedTripView travelLog={travelLog} shareId={params.shareId} />;
}