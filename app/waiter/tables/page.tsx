  "use client";

  import { useEffect, useState } from "react";
  import { useQuery, useMutation, gql } from "@apollo/client";
  import { LogOut } from "lucide-react";

  import { useApp } from "@/src/context/AppContext";
  import TableItem from "@/src/components/TableItem";
  import TableActionModal from "@/src/components/modals/TableActionModal";
  import TableOrderModal from "@/src/components/TableOrder";
  import { Table } from "@/src/entity/entitys";



  /* =======================
    GraphQL
  ======================= */

  export const CHANGE_TABLE_STATUS = gql`
    mutation ChangeTableStatus($input: ChangeTableStatusInput!) {
      changeTableStatus(input: $input) {
        id
        status
        hasActiveOrder
      }
    }
  `;

  export const GET_FLOORS = gql`
    query GetFloors($businessId: String!) {
      getFloors(businessId: $businessId) {
        id
        name
        tables {
          id
          name
          status
          capacity
          shape
          coordX
          coordY
          hasActiveOrder
          orders {
            id
            status
            subtotal
            tax
            discount
            tip
            total
            items {
              id
              quantity
                product{
                  name
                  price
                }
            }
          }
        }
      }
    }
  `;

  /* =======================
    Page
  ======================= */

  export default function TablesPage() {
    const { user, logout } = useApp();

    const [floorIdx, setFloorIdx] = useState(0);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [openOrderModal, setOpenOrderModal] = useState(false);

    const { data, loading, error } = useQuery(GET_FLOORS, {
      variables: { businessId: user?.businessId },
      skip: !user?.businessId,
    });

    const [changeTableStatus] = useMutation(CHANGE_TABLE_STATUS);

    const handleCloseActionModal = () => {
      setSelectedTable(null);
    };

    const handleTakeOrder = () => {
      if (!selectedTable) return;

      setOpenOrderModal(true);

    };

    const [floors,setFloors] = useState<any[]>([]);
    useEffect(() => {
      if (!loading && data?.getFloors) {
        setFloors(data.getFloors);
    
        if (selectedTable) {
          // Buscar la mesa actual en los pisos actualizados
          let updatedTable: Table | undefined = undefined;
          for (const floor of data.getFloors) {
            const table = floor.tables.find((t: Table) => t.id === selectedTable.id);
            if (table) {
              updatedTable = table;
              break;
            }
          }
    
          if (updatedTable) {
            setSelectedTable(updatedTable); // Actualiza selectedTable con los datos más recientes
          }
        }
      }
    }, [data, loading, selectedTable]);

    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center font-bold text-blue-600">
          Cargando salón...
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-10 text-center text-red-500">
          Error: {error.message}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">

        {/* ===== Modales ===== */}

      {selectedTable !== null && (
        
        <TableActionModal
        userId={user?.id}
        businessId={user?.businessId}
        orders={selectedTable.orders ? selectedTable.orders : []}
        open={!!selectedTable}
        tableId={selectedTable?.id}
        tableName={selectedTable?.name}
        status={selectedTable?.status}
        hasOrder={Boolean(selectedTable?.orders?.length)}
        onClose={handleCloseActionModal}
        onChangeStatus={(status) => {
          if (!selectedTable) return;

          changeTableStatus({
            variables: {
              input: {
                tableId: selectedTable.id,
                newStatus: status,
              },
            },
          });

          handleCloseActionModal();
        }}
        onTakeOrder={handleTakeOrder}
      />

      )}
          {selectedTable !== null && 
          <TableOrderModal
          open={openOrderModal}
          onClose={() => setOpenOrderModal(false)}
          tableId={selectedTable?.id}
          businessId={user?.businessId}
          userId={user?.id}
        />
        }

        {/* ===== Header ===== */}

        <div className="bg-white p-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="font-bold text-xl text-gray-900">{user?.role}</h1>
            <p className="text-xs text-gray-500">Selecciona una mesa</p>
          </div>

          <button
            onClick={logout}
            className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* ===== Tabs de Pisos ===== */}

        {floors.length > 0 ? (
          <>
            <div className="flex gap-3 p-4 overflow-x-auto bg-white border-b">
              {floors.map((floor: any, idx: number) => (
                <button
                  key={floor.id}
                  onClick={() => setFloorIdx(floor.id)}
                  className={`px-5 py-2 rounded-full font-medium transition-all ${
                    idx === floorIdx
                      ? "bg-blue-600 text-white ring-2 ring-blue-300"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  {floor.name}
                </button>
              ))}
            </div>

            {/* ===== Plano ===== */}

            <div className="relative flex-1 overflow-auto bg-gray-100">
              {floors[floorIdx]?.tables?.map((table: Table  ) => (
                <TableItem
                  table={table}
                  key={table.id}
                  id={table.id}
                  name={table.name}
                  x={table.coordX}
                  y={table.coordY}
                  shape={table.shape}
                  status={table.status}
                  onSelectTable={() => setSelectedTable(table)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="p-10 text-center text-gray-500">
            No hay pisos configurados.
          </div>
        )}
      </div>
    );
  }
