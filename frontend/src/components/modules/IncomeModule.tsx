<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle className="text-lg font-semibold">
        {editing ? 'Edit Payment Certificate' : 'New Payment Certificate'}
      </DialogTitle>
      <p className="text-xs text-muted-foreground mt-1">
        Fill in the certificate details below. VAT and retention will be calculated automatically.
      </p>
    </DialogHeader>
    
    <div className="grid gap-4 py-4">
      {/* Project Selection */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Project *</Label>
        <Select value={form.projectId?.toString() || ''} onValueChange={v => setForm({ ...form, projectId: Number(v) })}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects
              .filter(p => p.status === 'Active')
              .map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>
                  {p.name}
                </SelectItem>
              ))}
            {projects.filter(p => p.status === 'Active').length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No active projects found. Please load sample data.
              </div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Certificate No and Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Certificate No *</Label>
          <Input 
            value={form.certificateNo} 
            onChange={e => setForm({ ...form, certificateNo: e.target.value })} 
            placeholder="e.g., IPC-001"
            className="h-9"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Date *</Label>
          <Input 
            type="date" 
            value={form.date} 
            onChange={e => setForm({ ...form, date: e.target.value })} 
            className="h-9"
          />
        </div>
      </div>

      {/* Gross Amount and Retention */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Gross Amount (KES) *</Label>
          <Input 
            type="number" 
            value={form.grossAmount || ''} 
            onChange={e => setForm({ ...form, grossAmount: Number(e.target.value) })} 
            placeholder="0.00"
            className="h-9 font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Retention (%)</Label>
          <Input 
            type="number" 
            value={form.retentionPercent} 
            onChange={e => setForm({ ...form, retentionPercent: Number(e.target.value) })} 
            step="0.5"
            className="h-9"
          />
        </div>
      </div>

      {/* Calculations Card - Only show when grossAmount > 0 */}
      {form.grossAmount > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold mb-3 text-blue-800 dark:text-blue-300">💰 Calculation Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center pb-1 border-b border-blue-200 dark:border-blue-800">
              <span className="text-muted-foreground">Gross Amount</span>
              <span className="font-mono font-semibold">{formatCurrency(form.grossAmount)}</span>
            </div>
            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
              <span>+ VAT (16%)</span>
              <span className="font-mono">{formatCurrency(calculateVAT(form.grossAmount))}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>= Gross + VAT</span>
              <span className="font-mono font-medium">{formatCurrency(form.grossAmount + calculateVAT(form.grossAmount))}</span>
            </div>
            <div className="flex justify-between items-center text-amber-600 dark:text-amber-400">
              <span>- Retention ({form.retentionPercent}% of Gross)</span>
              <span className="font-mono">{formatCurrency(calculateRetention(form.grossAmount, form.retentionPercent))}</span>
            </div>
            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-blue-300 dark:border-blue-700">
              <span className="font-bold">Net Payable</span>
              <span className="font-mono font-bold text-lg text-blue-700 dark:text-blue-400">
                {formatCurrency(calculateNetPayable(form.grossAmount, form.retentionPercent))}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Amount Received and Payment Date */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Amount Received (KES)</Label>
          <Input 
            type="number" 
            value={form.amountReceived || ''} 
            onChange={e => setForm({ ...form, amountReceived: Number(e.target.value) })} 
            placeholder="0.00"
            className="h-9 font-mono"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Payment Date</Label>
          <Input 
            type="date" 
            value={form.paymentDate} 
            onChange={e => setForm({ ...form, paymentDate: e.target.value })} 
            className="h-9"
          />
        </div>
      </div>

      {/* Payment Method and Status */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Payment Method</Label>
          <Select value={form.paymentMethod} onValueChange={v => setForm({ ...form, paymentMethod: v })}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
              <SelectItem value="Cheque">Cheque</SelectItem>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="M-Pesa">M-Pesa</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs font-semibold">Status</Label>
          <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label className="text-xs font-semibold">Notes</Label>
        <Input 
          value={form.notes} 
          onChange={e => setForm({ ...form, notes: e.target.value })} 
          placeholder="Additional notes or remarks..."
          className="h-9"
        />
      </div>

      {/* Balance Information */}
      {form.grossAmount > 0 && form.amountReceived > 0 && (
        <div className={`rounded-lg p-3 text-sm ${form.amountReceived >= calculateNetPayable(form.grossAmount, form.retentionPercent) ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800'}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Remaining Balance:</span>
            <span className={`font-mono font-bold ${form.amountReceived >= calculateNetPayable(form.grossAmount, form.retentionPercent) ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
              {formatCurrency(Math.max(0, calculateNetPayable(form.grossAmount, form.retentionPercent) - form.amountReceived))}
            </span>
          </div>
          {form.amountReceived >= calculateNetPayable(form.grossAmount, form.retentionPercent) && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">✓ Fully paid</p>
          )}
        </div>
      )}
    </div>

    <div className="flex justify-end gap-3 pt-2">
      <Button variant="outline" onClick={() => setOpen(false)} size="default">
        Cancel
      </Button>
      <Button onClick={handleSave} size="default" className="bg-blue-600 hover:bg-blue-700">
        {editing ? 'Update Certificate' : 'Create Certificate'}
      </Button>
    </div>
  </DialogContent>
</Dialog>