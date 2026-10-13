import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui";
import { Button } from "./ui/button";
import { LogOut, Loader2 } from "lucide-react";

interface LogOutPopUpProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  onClose?: () => void;
  onLogout: () => void;
  isPending: boolean;
  isText?: boolean;
}

const LogOutPopUp: React.FC<LogOutPopUpProps> = ({
  open,
  setOpen,
  onClose,
  onLogout,
  isPending,
  isText = true,
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            type="button"
            aria-label="Sign Out"
            title="Sign Out"
            disabled={isPending}
            className="h-9 px-2.5 flex w-fit items-center gap-1.5 rounded-lg bg-crm-info text-crm-dark hover:border-crm-brand text-accent-foreground hover:text-rose-600 hover:bg-rose-50 border border-crm-subtle transition-all text-xs font-semibold disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-600" />
            ) : (
              <LogOut className="w-3.5 h-3.5" />
            )}
               {isText && <span className="inline">
           {(isPending ? "Signing out..." : "Sign Out")}
            </span>}
          </button>
        }
      />
      <DialogContent className="bg-card max-sm:w-[90%] border border-crm-subtle text-crm-primary shadow-xl rounded-lg p-5 max-w-sm ">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm font-bold text-crm-primary flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
              <LogOut className="w-3.5 h-3.5" />
            </span>
            Confirm Sign Out
          </DialogTitle>
          <DialogDescription className="text-xs text-crm-muted leading-relaxed">
            Are you sure you want to end your session? Any unsaved form drafts
            will be discarded.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row items-center justify-end gap-2.5 mt-2 sm:justify-end">
          <DialogClose
            render={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen?.(false);
                  onClose?.();
                }}
                disabled={isPending}
                className="rounded-lg text-xs min-w-21 px-4 h-9 border-crm-subtle hover:bg-crm-muted text-crm-secondary font-medium cursor-pointer"
              >
                Cancel
              </Button>
            }
          />
          <Button
            type="button"
            onClick={onLogout}
            disabled={isPending}
            className="rounded-lg text-xs min-w-21 px-4 h-9 bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Signing out...
              </>
            ) : (
              "Sign Out"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogOutPopUp;
