'use client'

import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Text } from '@/components/text'
import { getEvents, getRecentOrders } from '@/data'
import { CloudArrowUpIcon } from '@heroicons/react/20/solid'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

// Define interfaces for our data
interface Order {
  id: number;
  url: string;
  date: string;
  amount: {
    usd: string;
    cad: string;
    fee: string;
    net: string;
  };
  payment: {
    transactionId: string;
    card: {
      number: string;
      type: string;
      expiry: string;
    };
  };
  customer: any;
  event: any;
}

interface Generation {
  id: number;
  name: string;
  url: string;
  date: string;
  time: string;
  location: string;
  totalRevenue: string;
  totalRevenueChange: string;
  ticketsAvailable: number;
  ticketsSold: number;
  ticketsSoldChange: string;
  status: string;
  imgUrl: string;
  thumbUrl: string;
}

export default function Home() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentGenerations, setRecentGenerations] = useState<Generation[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [subjectFile, setSubjectFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersData = await getRecentOrders();
        const generationsData = await getEvents();
        setOrders(ordersData);
        setRecentGenerations(generationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    
    fetchData();
  }, []);
  
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setLogoFile(event.target.files[0]);
    }
  };
  
  const handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSubjectFile(event.target.files[0]);
    }
  };
  
  return (
    <>
      <Text className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        Generate images with your logo seamlessly integrated
      </Text>
      
      {/* Unified Image Generation Section */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo Upload Area */}
          <div className="relative group h-60">
            {logoFile ? (
              <>
                <img 
                  src={URL.createObjectURL(logoFile)} 
                  alt="Logo preview" 
                  className="absolute inset-0 h-full w-full rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-30 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    className="opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
                    onClick={() => {
                      const fileInput = document.getElementById('logo-upload');
                      if (fileInput) fileInput.click();
                    }}
                  >
                    Change
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <CloudArrowUpIcon className="h-10 w-10 text-zinc-400" />
                <div className="mt-3 flex flex-col items-center justify-center">
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                    Drop your logo here
                  </Text>
                  <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    PNG, JPG up to 10MB
                  </Text>
                </div>
                <Button 
                  className="mt-3"
                  onClick={() => {
                    const fileInput = document.getElementById('logo-upload');
                    if (fileInput) fileInput.click();
                  }}
                >
                  Select Logo
                </Button>
              </div>
            )}
            <input 
              type="file" 
              id="logo-upload" 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleLogoChange}
            />
          </div>

          {/* Subject Image Upload Area */}
          <div className="relative group h-60">
            {subjectFile ? (
              <>
                <img 
                  src={URL.createObjectURL(subjectFile)} 
                  alt="Subject preview" 
                  className="absolute inset-0 h-full w-full rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-200 group-hover:opacity-30 rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    className="opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
                    onClick={() => {
                      const fileInput = document.getElementById('subject-upload');
                      if (fileInput) fileInput.click();
                    }}
                  >
                    Change
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                <CloudArrowUpIcon className="h-10 w-10 text-zinc-400" />
                <div className="mt-3 flex flex-col items-center justify-center">
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                    Drop your subject image here
                  </Text>
                  <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    PNG, JPG up to 10MB
                  </Text>
                </div>
                <Button 
                  className="mt-3"
                  onClick={() => {
                    const fileInput = document.getElementById('subject-upload');
                    if (fileInput) fileInput.click();
                  }}
                >
                  Select Image
                </Button>
              </div>
            )}
            <input 
              type="file" 
              id="subject-upload" 
              className="hidden" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleSubjectChange}
            />
          </div>

          {/* Result Preview Area */}
          <div>
            <div className="flex h-60 w-full flex-col items-center justify-center rounded-lg border-2 border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <ArrowPathIcon className="h-10 w-10 text-zinc-400" />
              <Text className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
                Preview will appear here
              </Text>
            </div>
          </div>
        </div>
        
        {/* Prompt Input and Generate Button */}
        <div className="mt-8">
          <div className="mx-auto flex w-full max-w-3xl">
            <div className="flex w-full overflow-hidden rounded-lg border border-zinc-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 dark:border-zinc-700 dark:bg-zinc-900">
              <input
                type="text"
                className="w-full flex-1 border-none bg-transparent px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-zinc-400"
                placeholder="Describe how you want the logo to appear on the subject image..."
              />
              <button className="flex min-w-32 items-center justify-center bg-zinc-900 px-8 py-3 text-[16px] font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-1 active:bg-zinc-950 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:active:bg-zinc-900">
                Generate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Generations Section */}
      <Subheading className="mt-12">Recent Generations</Subheading>
      <Table className="mt-4 [--gutter:--spacing(6)] lg:[--gutter:--spacing(10)]">
        <TableHead>
          <TableRow>
            <TableHeader>Date</TableHeader>
            <TableHeader>Time</TableHeader>
            <TableHeader>Logo</TableHeader>
            <TableHeader>Subject</TableHeader>
            <TableHeader>Result</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {recentGenerations.map((generation) => (
            <TableRow key={generation.id} href={`/generations/${generation.id}`} title={`Generation #${generation.id}`}>
              <TableCell>{generation.date}</TableCell>
              <TableCell>{generation.time}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={generation.thumbUrl} className="size-6" />
                  <span className="text-xs text-zinc-600">logo-{generation.id}.png</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={generation.imgUrl} className="size-6" />
                  <span className="text-xs text-zinc-600">subject-{generation.id}.jpg</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar src={generation.imgUrl} className="size-6" />
                  <span className="text-xs text-zinc-600">result-{generation.id}.png</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}
