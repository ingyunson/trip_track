// src/components/OpenGraphMeta.tsx
'use client';

import Head from 'next/head';

interface OpenGraphMetaProps {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

const OpenGraphMeta: React.FC<OpenGraphMetaProps> = ({ 
  title, 
  description, 
  imageUrl, 
  url 
}) => {
  // Fallback image if none provided
  const finalImageUrl = imageUrl || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={finalImageUrl} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={finalImageUrl} />
    </Head>
  );
};

export default OpenGraphMeta;