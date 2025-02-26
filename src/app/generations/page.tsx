import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { Divider } from '@/components/divider'
import { Dropdown, DropdownButton, DropdownItem, DropdownMenu } from '@/components/dropdown'
import { Heading } from '@/components/heading'
import { Input, InputGroup } from '@/components/input'
import { Link } from '@/components/link'
import { Select } from '@/components/select'
import { getEvents } from '@/data'
import { EllipsisVerticalIcon, MagnifyingGlassIcon } from '@heroicons/react/16/solid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Generations',
}

export default async function Generations() {
  // Using events data temporarily - in production this would be replaced with generated logos data
  let generations = await getEvents()

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-sm:w-full sm:flex-1">
          <Heading>Generations</Heading>
          <div className="mt-4 flex max-w-xl gap-4">
            <div className="flex-1">
              <InputGroup>
                <MagnifyingGlassIcon />
                <Input name="search" placeholder="Search generations..." />
              </InputGroup>
            </div>
            <div>
              <Select name="sort_by">
                <option value="date">Sort by date</option>
                <option value="name">Sort by name</option>
                <option value="status">Sort by status</option>
              </Select>
            </div>
          </div>
        </div>
        <Button>Generate new</Button>
      </div>
      <ul className="mt-10">
        {generations.map((generation, index) => (
          <li key={generation.id}>
            <Divider soft={index > 0} />
            <div className="flex items-center justify-between">
              <div key={generation.id} className="flex gap-6 py-6">
                <div className="w-32 shrink-0">
                  <Link href={`/generations/${generation.id}`} aria-hidden="true">
                    <img className="aspect-3/2 rounded-lg shadow-sm" src={generation.imgUrl} alt="" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  <div className="text-base/6 font-semibold">
                    <Link href={`/generations/${generation.id}`}>{generation.name}</Link>
                  </div>
                  <div className="text-xs/6 text-zinc-500">
                    Generated on {generation.date} at {generation.time}
                  </div>
                  <div className="text-xs/6 text-zinc-600">
                    Style: {generation.location}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="max-sm:hidden" color={generation.status === 'On Sale' ? 'lime' : 'zinc'}>
                  {generation.status === 'On Sale' ? 'Completed' : generation.status}
                </Badge>
                <Dropdown>
                  <DropdownButton plain aria-label="More options">
                    <EllipsisVerticalIcon />
                  </DropdownButton>
                  <DropdownMenu anchor="bottom end">
                    <DropdownItem href={`/generations/${generation.id}`}>View</DropdownItem>
                    <DropdownItem>Download</DropdownItem>
                    <DropdownItem>Delete</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
} 