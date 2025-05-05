import { useEffect, useRef, useState, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { usePaginatedUsers } from "../hooks/usePaginatedUsers.hook";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [didLoadOnce, setDidLoadOnce] = useState(false);
  const parentRef = useRef();

  const LIMIT = 50;

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const { users: newUsers, totalPages } = await usePaginatedUsers(page, LIMIT);
      setUsers((prev) => [...prev, ...newUsers]);
      setPage((prev) => prev + 1);
      if (page >= totalPages) setHasMore(false);
    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initLoad = async () => {
      await loadMore();
      setDidLoadOnce(true);
    };
    initLoad();
  }, []);

  const columns = useMemo(() => [
    {
      header: "Name",
      accessorKey: "name",
      minWidth: 150,
      maxWidth: 200,
    },
    {
      header: "Email",
      accessorKey: "email",
      minWidth: 250,
      maxWidth: 300,
    },
    {
      header: "Phone",
      accessorFn: (row) => {
        const digits = row.phone.replace(/\D/g, "").slice(-10);
        return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      },
      minWidth: 180,
      maxWidth: 220,
    },
    {
      header: "Company (City)",
      accessorFn: (row) => `${row.company.name} (${row.address.city})`,
      minWidth: 200,
      maxWidth: 350,
    },
  ], []);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const rowVirtualizer = useVirtualizer({
    count: users.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  useEffect(() => {
    if (!didLoadOnce) return;

    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();
    if (!lastItem) return;

    if (
      lastItem.index >= users.length - 1 &&
      hasMore &&
      !loading
    ) {
      loadMore();
    }
  }, [rowVirtualizer.getVirtualItems(), hasMore, loading, users.length, didLoadOnce]);

  const getColumnStyle = (column) => {
    const { minWidth, maxWidth } = column.columnDef;
    let style = {};
    if (minWidth) {
      style.minWidth = `${minWidth}px`;
    }
    if (maxWidth) {
      style.maxWidth = `${maxWidth}px`;
    }
    return style;
  };

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <h2 className="text-xl font-bold mb-4">Users</h2>
      <table className="min-w-full table-auto border border-gray-300">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="text-left px-4 py-2 border-b border-gray-300 font-semibold"
                  style={getColumnStyle(header.column)}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const isLoaderRow = virtualRow.index >= users.length;
            const row = table.getRowModel().rows[virtualRow.index];

            return (
              <tr
                key={virtualRow.key}
                ref={rowVirtualizer.measureElement}
                data-index={virtualRow.index}
                className="border-b border-gray-200 absolute inset-x-0"
                style={{
                  transform: `translateY(${virtualRow.start}px)`,
                  display: "table",
                  tableLayout: "fixed",
                  width: "100%",
                }}
              >
                {isLoaderRow ? (
                  <td colSpan={columns.length} className="px-4 py-2 text-center">
                    Loading more...
                  </td>
                ) : (
                  row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2" style={getColumnStyle(cell.column)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;