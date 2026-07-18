import InventoryMovements from "../../InventoryMovements";
import SectionTitle from "../../shared/ui/SectionTitle";

export default function InventoryRecentMovements() {
  return (
    <>
      <SectionTitle>
        Últimos movimientos
      </SectionTitle>

      <InventoryMovements />
    </>
  );
}
