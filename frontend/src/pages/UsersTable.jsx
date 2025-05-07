import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { usePaginatedUsers } from "../hooks/usePaginatedUsers.hook.js";
import { useEffect, useMemo, useRef, useState } from "react";

const columnHelper = createColumnHelper();

const UsersTable = () => {
  const LIMIT = 50;
  const parentRef = useRef();
  const pageRef = useRef(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fetchingNextPage, setFetchingNextPage] = useState(false);
 
  const { users, loading, hasMore, error } = usePaginatedUsers(
    pageRef.current,
    LIMIT
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => info.getValue(),
        minWidth: 150,
        maxWidth: 200,
      }),
      columnHelper.accessor("email", {
        header: "Email",
        cell: (info) => info.getValue(),
        minWidth: 250,
        maxWidth: 300,
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        minWidth: 180,
        maxWidth: 220,
        accessorFn: (row) => {
          const digits = row.phone.replace(/\D/g, "").slice(-10);
          return `+1-${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
        },
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("company.name", {
        header: "Company (City)",
        cell: (info) =>
          `${info.row.original.company.name} (${info.row.original.address.city})`,
        minWidth: 200,
        maxWidth: 350,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const getColumnStyles = (column) => {
    let style = {};
    if (column.minWidth) {
      style.minWidth = `${column.minWidth}px`;
    }
    if (column.maxWidth) {
      style.maxWidth = `${column.maxWidth}px`;
    }
    return style;
  };

  const rowVirtualizer = useVirtualizer({
    count: users.length + (hasMore ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 10,
  });

  const { virtualRows, paddingTop, paddingBottom } = useMemo(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
    const paddingBottom =
      virtualItems.length > 0
        ? rowVirtualizer.getTotalSize() -
          virtualItems[virtualItems.length - 1].end
        : 0;
    return { virtualRows: virtualItems, paddingTop, paddingBottom };
  }, [rowVirtualizer.getVirtualItems()]);

 
  useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
  
    if (isInitialLoad && !loading) {
      setIsInitialLoad(false);
      return;
    }
  
    if (
      lastItem?.index >= users.length - 1 &&
      hasMore &&
      !loading &&
      !fetchingNextPage
    ) {
      setFetchingNextPage(true);
      pageRef.current += 1;
    }
  }, [
    rowVirtualizer.getVirtualItems().length,
    users.length,
    hasMore,
    loading,
    isInitialLoad,
    fetchingNextPage,
  ]);

  useEffect(() => {
    if (!loading) {
      setFetchingNextPage(false);
    }
  }, [loading]);

  return (
    <div className="h-screen flex flex-col p-8">
      <h2 className="text-xl font-bold mb-4">Users Table</h2>

      {error && <div className="text-red-500">{error}</div>}

      <div className="flex-1 border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        <div className="h-full overflow-auto scrollbar-hide" ref={parentRef}>
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 bg-[#6d7ae0] text-white z-10 pr-[16px]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="h-14">
                  {headerGroup.headers.map((header) => {
                    const column = header.column.columnDef;
                    const headerStyle = getColumnStyles(column);
                    return (
                      <th
                        key={header.id}
                        className="text-left px-4 py-2 border-b border-gray-300 font-medium text-xl"
                        style={headerStyle}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>

            <tbody>
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}

              {virtualRows.map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index];
                if (!row) {
                  return null; 
                }
                return (
                  <tr key={row.id} className="border-b border-gray-200">
                    {row.getVisibleCells().map((cell) => {
                      const style = getColumnStyles(cell.column.columnDef);
                      return (
                        <td
                          key={cell.id}
                          className="px-4 py-2 text-sm"
                          style={style}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
              {loading && users.length > 0 && (
                <tr>
                  <td colSpan={columns.length} className="text-center py-4">
                    Loading...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;