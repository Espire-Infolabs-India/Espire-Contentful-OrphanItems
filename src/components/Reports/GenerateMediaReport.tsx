import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Button,
  Flex,
  Heading,
  Spinner,
  Badge,
} from "@contentful/f36-components";
import { useState } from "react";
import { DeleteIcon } from "@contentful/f36-icons";
import PaginationControl from "../../locations/PaginationWithTotal";
import { formatDistanceToNow } from "date-fns";
const capitalizeFirst = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

const statusColorMap: Record<
  string,
  "positive" | "warning" | "primary" | "negative" | "secondary"
> = {
  published: "positive",
  changed: "primary",
  draft: "warning",
  archived: "secondary",
};

const getAssetStatus = (asset: any): string => {
  if (asset?.sys?.archivedAt) return "Archived";
  const status =
    asset?.sys?.fieldStatus?.["*"]?.["en-US"] ||
    asset?.sys?.status ||
    "Unknown";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};
type Props = {
  unusedMedia: any[];
  selectedAssets: string[];
  toggleAssetSelection: (id: string) => void;
  handleDeleteAssets: () => void;
};

const GenerateMediaReport = ({
  unusedMedia,
  selectedAssets,
  toggleAssetSelection,
  handleDeleteAssets,
}: Props) => {
  const [page, setPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  if (!unusedMedia || unusedMedia.length === 0) {
    return <Spinner size="medium" />;
  }

  const paginatedEntries = unusedMedia.slice(
    page * itemsPerPage,
    (page + 1) * itemsPerPage
  );
  const paginatedIds = paginatedEntries?.map((e) => e.sys.id);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelections = paginatedIds.filter(
        (id) => !selectedAssets.includes(id)
      );
      newSelections.forEach((id) => toggleAssetSelection(id));
    } else {
      paginatedIds.forEach((id) => {
        if (selectedAssets.includes(id)) toggleAssetSelection(id);
      });
    }
  };

  return (
    <>
      <Heading className="h1">Unused Media Items</Heading>

      <Flex justifyContent="space-between" marginBottom="spacingM">
        <Button
          variant="negative"
          isDisabled={selectedAssets.length === 0}
          onClick={handleDeleteAssets}
        >
          <span className="flex-design align-item-center">
            Delete Selected
          </span>
        </Button>
      </Flex>

      <Table className="mt-4">
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                isChecked={paginatedIds.every((id) =>
                  selectedAssets.includes(id)
                )}
                onChange={(e) => handleSelectAll(e.target.checked)}
                aria-label="Select All"
              />
            </TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Dimensions</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Updated</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedEntries.map((asset) => {
            const file = asset.fields?.file?.["en-US"];
            const fileUrl = file?.url?.startsWith("//")
              ? `https:${file?.url}`
              : file?.url;
            const name =
              asset.fields?.name?.["en-US"] ||
              asset.fields?.title?.["en-US"] ||
              "(untitled)";
            const dimensions = file?.details?.image
              ? `${file?.details?.image?.width}px × ${file?.details?.image?.height}px`
              : "—";
            const types = file?.contentType || "—";
            const type = capitalizeFirst(types) || "—";
            const updated = asset.sys.updatedAt
              ? formatDistanceToNow(new Date(asset.sys.updatedAt), {
                  addSuffix: true,
                }).replace("about", "")
              : "—";
            // const status = asset.sys.fieldStatus?.["*"]?.["en-US"] || "—";
            const statusRaw = asset.sys.archivedAt
              ? "archived"
              : asset.sys?.fieldStatus?.["*"]?.["en-US"];
            const status = capitalizeFirst(statusRaw);

            return (
              <TableRow key={asset?.sys?.id}>
                <TableCell>
                  <Checkbox
                    isChecked={selectedAssets.includes(asset?.sys?.id)}
                    onChange={() => toggleAssetSelection(asset?.sys?.id)}
                    aria-label={`Select ${asset?.sys?.id}`}
                  />
                </TableCell>
                <TableCell>
                  <Flex alignItems="center" gap="spacingS">
                    {fileUrl && (
                      <img
                        src={`${fileUrl}?w=40&h=40&fit=thumb`}
                        alt={name}
                        width={40}
                        height={40}
                        style={{
                          borderRadius: "4px",
                          objectFit: "cover",
                          backgroundColor: "#f3f3f3",
                        }}
                      />
                    )}
                    <span>{name}</span>
                  </Flex>
                </TableCell>
                <TableCell>{dimensions}</TableCell>
                <TableCell>{type}</TableCell>
                <TableCell>{updated}</TableCell>
                <TableCell>
                  <Badge variant={statusColorMap[statusRaw]}>{status}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PaginationControl
        page={page}
        itemsPerPage={itemsPerPage}
        totalItems={unusedMedia?.length}
        onPageChange={setPage}
        onViewPerPageChange={(i) => {
          setPage(Math.floor((itemsPerPage * page + 1) / i));
          setItemsPerPage(i);
        }}
      />
    </>
  );
};

export default GenerateMediaReport;
