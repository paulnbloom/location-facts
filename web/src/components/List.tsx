interface ListProps {
  items?: string[] | Array<{ name: string; [key: string]: any }>
  emptyMessage?: string
  renderItem?: (item: any, index: number) => React.ReactNode
  className?: string
}

export default function List({
  items,
  emptyMessage = 'No good answer',
  renderItem,
  className = '',
}: ListProps) {
  // Handle undefined or empty items
  if (!items || items.length === 0) {
    return (
      <p className="text-gray-500 italic text-sm py-2">{emptyMessage}</p>
    )
  }

  return (
    <ul className={`list-disc list-inside space-y-1 ${className}`}>
      {items.map((item, index) => (
        <li key={index} className="text-gray-700">
          {renderItem ? renderItem(item, index) : typeof item === 'string' ? item : item.name}
        </li>
      ))}
    </ul>
  )
}
