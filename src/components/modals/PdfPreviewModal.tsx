import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function PdfPreviewModal({ isOpen, onClose, pdfUrl, onConfirm }: {
  isOpen: boolean,
  onClose: () => void,
  pdfUrl: string | null,
  onConfirm: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Preview Contract PDF</DialogTitle>
        </DialogHeader>
        <div className="h-[500px]">
          {pdfUrl && <iframe src={pdfUrl} width="100%" height="100%" />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm & Send</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
