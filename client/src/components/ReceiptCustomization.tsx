import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export interface TemplateOptions {
  storeAddress: string;
  storePhone: string;
  storeName: string;
  showBarcodeAtBottom: boolean;
  footerText: string;
  paperColor: string;
  textColor: string;
  returnDays: number;
}

interface ReceiptCustomizationProps {
  options: TemplateOptions;
  onChange: (options: TemplateOptions) => void;
  onReset: () => void;
}

const ReceiptCustomization = ({ 
  options, 
  onChange, 
  onReset 
}: ReceiptCustomizationProps) => {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const handleChange = (field: keyof TemplateOptions, value: any) => {
    onChange({
      ...options,
      [field]: value
    });
  };
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card className="w-full">
      <CardHeader className="cursor-pointer" onClick={toggleExpand}>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Template Customization
          </div>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input 
              id="storeName" 
              value={options.storeName} 
              onChange={(e) => handleChange('storeName', e.target.value)}
              placeholder="CVS/pharmacy"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storeAddress">Store Address</Label>
            <Input 
              id="storeAddress" 
              value={options.storeAddress} 
              onChange={(e) => handleChange('storeAddress', e.target.value)}
              placeholder="2015 Fayetteville Rd, VAN BUREN, AR 72956"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="storePhone">Store Phone</Label>
            <Input 
              id="storePhone" 
              value={options.storePhone} 
              onChange={(e) => handleChange('storePhone', e.target.value)}
              placeholder="(479)471-1608"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="footerText">Return Policy Text</Label>
            <Input 
              id="footerText" 
              value={options.footerText} 
              onChange={(e) => handleChange('footerText', e.target.value)}
              placeholder="RETURNS WITH RECEIPT THRU 6/29/2025"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="returnDays">Return Period (Days)</Label>
            <div className="flex items-center gap-4">
              <Slider
                id="returnDays"
                min={7}
                max={90}
                step={1}
                value={[options.returnDays]}
                onValueChange={(value) => handleChange('returnDays', value[0])}
                className="flex-1"
              />
              <span className="w-12 text-center">{options.returnDays}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperColor">Paper Color</Label>
              <Select 
                value={options.paperColor} 
                onValueChange={(value) => handleChange('paperColor', value)}
              >
                <SelectTrigger id="paperColor">
                  <SelectValue placeholder="Select paper color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="cream">Cream</SelectItem>
                  <SelectItem value="light-yellow">Light Yellow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <Select 
                value={options.textColor} 
                onValueChange={(value) => handleChange('textColor', value)}
              >
                <SelectTrigger id="textColor">
                  <SelectValue placeholder="Select text color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="dark-gray">Dark Gray</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 pt-1">
            <Switch 
              id="showBarcode" 
              checked={options.showBarcodeAtBottom}
              onCheckedChange={(checked) => handleChange('showBarcodeAtBottom', checked)}
            />
            <Label htmlFor="showBarcode">Show barcode at bottom</Label>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onReset}
            >
              Reset to Default
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                toast({
                  title: "Template Updated",
                  description: "Your customization has been applied",
                });
              }}
            >
              Apply Changes
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ReceiptCustomization;