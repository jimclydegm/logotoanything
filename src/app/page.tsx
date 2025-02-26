import { Avatar } from '@/components/avatar'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Heading, Subheading } from '@/components/heading'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/table'
import { Text } from '@/components/text'
import { getEvents, getRecentOrders } from '@/data'
import { CloudArrowUpIcon } from '@heroicons/react/20/solid'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

export default async function Home() {
  let orders = await getRecentOrders()
  let recentGenerations = await getEvents() // Using events data temporarily for recent generations

  return (
    <>
      <Text className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
        Generate images with your logo seamlessly integrated
      </Text>
      
      {/* Unified Image Generation Section */}
      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Logo Upload Area */}
          <div>
            <div className="flex h-60 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <CloudArrowUpIcon className="h-10 w-10 text-zinc-400" />
              <div className="mt-3 flex flex-col items-center justify-center">
                <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                  Drop your logo here
                </Text>
                <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  PNG, JPG up to 10MB
                </Text>
              </div>
              <Button className="mt-3">
                Select Logo
              </Button>
            </div>
          </div>

          {/* Subject Image Upload Area */}
          <div>
            <div className="flex h-60 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
              <CloudArrowUpIcon className="h-10 w-10 text-zinc-400" />
              <div className="mt-3 flex flex-col items-center justify-center">
                <Text className="text-sm font-medium text-zinc-900 dark:text-white">
                  Drop your subject image here
                </Text>
                <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  PNG, JPG up to 10MB
                </Text>
              </div>
              <Button className="mt-3">
                Select Image
              </Button>
            </div>
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
  )
}
