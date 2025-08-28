"use client";

import React from "react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Package,
  CheckCircle,
  Plus,
  Trash2,
} from "lucide-react";

interface Product {
  code: string;
  description: string;
  dimension: string;
  subcategory: string;
  category: string;
  priceByCountry: Record<string, { price: number; effectiveDate: string }>;
  costByCountry: Record<string, { cost: number; effectiveDate: string }>;
}

interface PartialPayment {
  id: string;
  amount: number;
  date: string;
}

interface OrderData {
  orderDate: string;
  orderNumber: string;
  orderType: "immediate" | "reservation";
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  hasNegotiatedDiscount: boolean;
  notes: string;
  seller: string;
  salesChannel: string;
  paymentMethod: string;
  carrier?: string;
  deliveryDate?: string;
  partialPayments: PartialPayment[];
  products: Array<{
    code: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
}

interface CustomerData {
  identification: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  reference: string;
  country: string;
  state: string;
  city: string;
}

const locationData = {
  Venezuela: {
    "Distrito Capital": ["Caracas"],
    Miranda: ["Los Teques", "Guarenas", "Guatire", "Petare", "Baruta"],
    Merida: ["Merida"],
    Carabobo: ["Valencia", "Puerto Cabello", "Naguanagua"],
    Zulia: ["Maracaibo", "Cabimas", "Ciudad Ojeda"],
    Aragua: ["Maracay", "La Victoria", "Turmero"],
    Lara: ["Barquisimeto", "Cabudare", "El Tocuyo"],
    Táchira: ["San Cristóbal", "Táriba", "Rubio"],
    Anzoátegui: ["Barcelona", "Puerto La Cruz", "El Tigre"],
    Bolívar: ["Ciudad Bolívar", "Puerto Ordaz", "Upata"],
    Falcón: ["Coro", "Punto Fijo", "La Vela de Coro"],
  },
  Colombia: {
    Cundinamarca: ["Bogotá", "Soacha", "Zipaquirá", "Facatativá"],
    Antioquia: ["Medellín", "Bello", "Itagüí", "Envigado"],
    "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá"],
    Atlántico: ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia"],
    Santander: ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta"],
    Bolívar: ["Cartagena", "Magangué", "Turbaco", "Arjona"],
    "Norte de Santander": ["Cúcuta", "Villa del Rosario", "Los Patios"],
    Córdoba: ["Montería", "Lorica", "Cereté", "Sahagún"],
    Tolima: ["Ibagué", "Espinal", "Melgar", "Honda"],
    Huila: ["Neiva", "Pitalito", "Garzón", "La Plata"],
  },
  "El Salvador": {
    "San Salvador": ["San Salvador", "Mejicanos", "Soyapango", "Delgado"],
    "La Libertad": ["Santa Tecla", "Antiguo Cuscatlán", "Quezaltepeque"],
    "San Miguel": ["San Miguel", "Moncagua", "Quelepa"],
    "Santa Ana": ["Santa Ana", "Chalchuapa", "Metapán"],
    Sonsonate: ["Sonsonate", "Acajutla", "Izalco"],
    Ahuachapán: ["Ahuachapán", "Atiquizaya", "Tacuba"],
    Usulután: ["Usulután", "Jiquilisco", "Berlín"],
    "La Paz": ["Zacatecoluca", "Olocuilta", "San Pedro Masahuat"],
    Chalatenango: ["Chalatenango", "Nueva Concepción", "La Palma"],
    Cuscatlán: ["Cojutepeque", "Suchitoto", "San Pedro Perulapán"],
  },
};

const customerSchema = z.object({
  identification: z.string().min(1, "La identificación es requerida"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("El email no es válido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  reference: z.string().optional(),
  country: z.string().min(1, "El país es requerido"),
  state: z.string().min(1, "El estado/departamento es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
});

const orderSchema = z.object({
  orderDate: z.string().min(1, "La fecha de orden es requerida"),
  orderType: z.enum(["immediate", "reservation"], {
    required_error: "El tipo de orden es requerido",
  }),
  seller: z.string().min(1, "El vendedor es requerido"),
  salesChannel: z.string().min(1, "El canal de venta es requerido"),
  paymentMethod: z.string().min(1, "La forma de pago es requerida"),
  carrier: z.string().optional(),
  deliveryDate: z.string().optional(),
  products: z
    .array(
      z.object({
        code: z.string(),
        description: z.string(),
        quantity: z.number().min(1),
        unitPrice: z.number().min(0),
        discount: z.number().min(0).max(100),
        total: z.number(),
      }),
    )
    .min(1, "Debe agregar al menos un producto"),
  partialPayments: z
    .array(
      z.object({
        amount: z.number().min(0),
        date: z.string(),
        id: z.string(),
      }),
    )
    .optional(),
});

const mockProducts: Product[] = [
  {
    code: "PROD001",
    description: "Producto Premium A",
    dimension: "30x20x10 cm",
    subcategory: "Premium",
    category: "Electrónicos",
    priceByCountry: {
      Venezuela: { price: 150, effectiveDate: "2024-01-01" },
      Colombia: { price: 180, effectiveDate: "2024-01-01" },
      "El Salvador": { price: 160, effectiveDate: "2024-01-01" },
    },
    costByCountry: {
      Venezuela: { cost: 100, effectiveDate: "2024-01-01" },
      Colombia: { cost: 120, effectiveDate: "2024-01-01" },
      "El Salvador": { cost: 110, effectiveDate: "2024-01-01" },
    },
  },
  {
    code: "PROD002",
    description: "Producto Estándar B",
    dimension: "25x15x8 cm",
    subcategory: "Estándar",
    category: "Hogar",
    priceByCountry: {
      Venezuela: { price: 80, effectiveDate: "2024-01-01" },
      Colombia: { price: 95, effectiveDate: "2024-01-01" },
      "El Salvador": { price: 85, effectiveDate: "2024-01-01" },
    },
    costByCountry: {
      Venezuela: { cost: 50, effectiveDate: "2024-01-01" },
      Colombia: { cost: 60, effectiveDate: "2024-01-01" },
      "El Salvador": { cost: 55, effectiveDate: "2024-01-01" },
    },
  },
  {
    code: "PROD003",
    description: "Colchon",
    dimension: "25x15x8 cm",
    subcategory: "Estándar",
    category: "Hogar",
    priceByCountry: {
      Venezuela: { price: 380, effectiveDate: "2024-01-01" },
      Colombia: { price: 395, effectiveDate: "2024-01-01" },
      "El Salvador": { price: 385, effectiveDate: "2024-01-01" },
    },
    costByCountry: {
      Venezuela: { cost: 150, effectiveDate: "2024-01-01" },
      Colombia: { cost: 160, effectiveDate: "2024-01-01" },
      "El Salvador": { cost: 155, effectiveDate: "2024-01-01" },
    },
  },
];

interface SalesData {
  customer: CustomerData;
  order: OrderData;
}

const steps = [
  { id: 1, title: "Datos del Cliente", icon: User },
  { id: 2, title: "Productos/Servicios", icon: Package },
  { id: 3, title: "Revisión y Confirmación", icon: CheckCircle },
];

export default function MultiStepSalesForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [salesData, setSalesData] = useState<SalesData>({
    customer: {
      identification: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      reference: "",
      country: "",
      state: "",
      city: "",
    },
    order: {
      orderDate: new Date().toISOString().split("T")[0],
      orderNumber: "",
      orderType: "immediate" as const,
      seller: "",
      salesChannel: "",
      paymentMethod: "",
      carrier: "",
      deliveryDate: "",
      products: [],
      partialPayments: [],
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: "",
    description: "",
    dimension: "",
    subcategory: "",
    category: "",
  });

  const [orderProducts, setOrderProducts] = useState<
    Array<{
      id: string;
      productCode: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      hasNegotiatedDiscount: boolean;
      total: number;
    }>
  >([]);

  const [productQuantity, setProductQuantity] = useState(1);
  const [productPrice, setProductPrice] = useState(0);
  const [productDiscount, setProductDiscount] = useState(0);
  const [hasNegotiatedDiscount, setHasNegotiatedDiscount] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const generateOrderNumber = (country: string) => {
    const countryPrefixes = {
      Venezuela: "VE",
      Colombia: "CO",
      "El Salvador": "SV",
    };
    const prefix =
      countryPrefixes[country as keyof typeof countryPrefixes] || "XX";
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}-${timestamp}`;
  };

  const validateStep1 = () => {
    try {
      customerSchema.parse(salesData.customer);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateStep2 = () => {
    console.log("[v0] Validating step 2, salesData.order:", salesData.order);
    try {
      orderSchema.parse(salesData.order);
      console.log("[v0] Step 2 validation passed");
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("[v0] Step 2 Este es el error:", error.errors);
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleNext = () => {
    console.log("[v0] HandleNext called, currentStep:", currentStep);
    if (currentStep === 1 && !validateStep1()) {
      console.log("[v0] Step 1 validation failed");
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      console.log("[v0] Step 2 validation failed");
      return;
    }
    console.log("[v0] Validation passed, moving to next step");
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      if (currentStep === 1) {
        const orderNumber = generateOrderNumber(salesData.customer.country);
        setSalesData((prev) => ({
          ...prev,
          order: { ...prev.order, orderNumber },
        }));
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCustomerChange = (field: keyof CustomerData, value: string) => {
    setSalesData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
        ...(field === "country" && { state: "", city: "" }),
        ...(field === "state" && { city: "" }),
      },
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleOrderChange = (
    field: keyof OrderData,
    value: string | number | boolean,
  ) => {
    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        [field]: value,
      },
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProductSelect = (productCode: string) => {
    const product = mockProducts.find((p) => p.code === productCode);
    if (product && salesData.customer.country) {
      const countryPrice = product.priceByCountry[salesData.customer.country];
      setSelectedProduct(product);
      setProductPrice(countryPrice?.price || 0);
    }
  };

  const handleCreateProduct = () => {
    // In a real app, this would save to database
    console.log("Creating new product:", newProduct);
    setShowCreateProduct(false);
    setNewProduct({
      code: "",
      description: "",
      dimension: "",
      subcategory: "",
      category: "",
    });
  };

  const handleSubmit = () => {
    console.log("Datos de venta:", salesData);
    alert("¡Venta registrada exitosamente!");
  };

  const progress = (currentStep / 3) * 100;

  const availableStates = salesData.customer.country
    ? Object.keys(
        locationData[salesData.customer.country as keyof typeof locationData] ||
          {},
      )
    : [];
  const availableCities =
    salesData.customer.country && salesData.customer.state
      ? locationData[salesData.customer.country as keyof typeof locationData]?.[
          salesData.customer.state
        ] || []
      : [];

  const addPartialPayment = () => {
    const newPayment: PartialPayment = {
      id: Date.now().toString(),
      amount: 0,
      date: new Date().toISOString().split("T")[0],
    };
    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        partialPayments: [...prev.order.partialPayments, newPayment],
      },
    }));
  };

  const updatePartialPayment = (
    id: string,
    field: "amount" | "date",
    value: number | string,
  ) => {
    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        partialPayments: prev.order.partialPayments.map((payment) =>
          payment.id === id ? { ...payment, [field]: value } : payment,
        ),
      },
    }));
  };

  const removePartialPayment = (id: string) => {
    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        partialPayments: prev.order.partialPayments.filter(
          (payment) => payment.id !== id,
        ),
      },
    }));
  };

  const filteredProducts = mockProducts.filter(
    (product) =>
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalAmount =
    productPrice * productQuantity * (1 - productDiscount / 100);
  const totalPartialPayments = salesData.order.partialPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const remainingAmount = totalAmount - totalPartialPayments;

  const addProductToOrder = () => {
    if (!selectedProduct) return;

    const newProduct = {
      id: Date.now().toString(),
      code: selectedProduct.code, // Cambiado de productCode a code para coincidir con el esquema
      description: selectedProduct.description, // Agregando description del producto
      quantity: productQuantity,
      unitPrice: productPrice,
      discount: productDiscount,
      hasNegotiatedDiscount: hasNegotiatedDiscount,
      total: productPrice * productQuantity * (1 - productDiscount / 100),
    };

    const updatedProducts = [...orderProducts, newProduct];
    setOrderProducts(updatedProducts);

    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        products: updatedProducts.map((p) => ({
          code: p.code,
          description: p.description,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          discount: p.discount,
          total: p.total,
        })),
      },
    }));

    // Reset form
    setSelectedProduct(null);
    setProductQuantity(1);
    setProductPrice(0);
    setProductDiscount(0);
    setHasNegotiatedDiscount(false);
  };

  const removeProductFromOrder = (productId: string) => {
    setOrderProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateOrderProduct = (productId: string, field: string, value: any) => {
    setOrderProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          const updated = { ...product, [field]: value };
          if (
            field === "quantity" ||
            field === "unitPrice" ||
            field === "discount"
          ) {
            updated.total = calculateProductTotal(
              updated.quantity,
              updated.unitPrice,
              updated.discount,
            );
          }
          return updated;
        }
        return product;
      }),
    );
  };

  const calculateProductTotal = (
    quantity: number,
    unitPrice: number,
    discount: number,
  ) => {
    const subtotal = quantity * unitPrice;
    const discountAmount = subtotal * (discount / 100);
    return subtotal - discountAmount;
  };

  const calculateOrderTotal = () => {
    return orderProducts.reduce((total, product) => total + product.total, 0);
  };

  const removeProduct = (id: string) => {
    const updatedProducts = orderProducts.filter(
      (product) => product.id !== id,
    );
    setOrderProducts(updatedProducts);

    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        products: updatedProducts.map((p) => ({
          code: p.code,
          description: p.description,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          discount: p.discount,
          total: p.total,
        })),
      },
    }));
  };

  const updateProductQuantity = (productId: string, newQuantity: number) => {
    const updatedProducts = orderProducts.map((product) =>
      product.id === productId
        ? {
            ...product,
            quantity: newQuantity,
            total: calculateProductTotal(
              newQuantity,
              product.unitPrice,
              product.discount,
            ),
          }
        : product,
    );
    setOrderProducts(updatedProducts);

    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        products: updatedProducts,
      },
    }));
  };

  const updateProduct = (id: string, field: string, value: number) => {
    const updatedProducts = orderProducts.map((product) => {
      if (product.id === id) {
        const updated = { ...product, [field]: value };
        if (
          field === "quantity" ||
          field === "unitPrice" ||
          field === "discount"
        ) {
          updated.total =
            updated.unitPrice * updated.quantity * (1 - updated.discount / 100);
        }
        return updated;
      }
      return product;
    });

    setOrderProducts(updatedProducts);

    setSalesData((prev) => ({
      ...prev,
      order: {
        ...prev.order,
        products: updatedProducts.map((p) => ({
          code: p.code,
          description: p.description,
          quantity: p.quantity,
          unitPrice: p.unitPrice,
          discount: p.discount,
          total: p.total,
        })),
      },
    }));
  };

  return (
    <div className="bg-background min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-2 text-3xl font-bold">
            Registro de Venta
          </h1>
          <p className="text-muted-foreground">
            Complete los siguientes pasos para registrar una nueva venta
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center space-x-2 ${
                    step.id === currentStep
                      ? "text-primary"
                      : step.id < currentStep
                        ? "text-accent"
                        : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step.id === currentStep
                        ? "border-primary bg-primary text-primary-foreground"
                        : step.id < currentStep
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="hidden text-sm font-medium sm:block">
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-muted-foreground mt-2 text-center text-sm">
            Paso {currentStep} de 3
          </p>
        </div>

        {/* Form Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(steps[currentStep - 1].icon, {
                className: "w-5 h-5",
              })}
              <span>{steps[currentStep - 1].title}</span>
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Ingrese la información del cliente"}
              {currentStep === 2 && "Configure los detalles del pedido"}
              {currentStep === 3 && "Revise la información antes de confirmar"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Customer Data */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ... existing customer form fields ... */}
                <div className="space-y-2">
                  <Label htmlFor="identification">
                    Identificación/Cédula *
                  </Label>
                  <Input
                    id="identification"
                    placeholder="Ingrese la identificación"
                    value={salesData.customer.identification}
                    onChange={(e) =>
                      handleCustomerChange("identification", e.target.value)
                    }
                    className={
                      errors.identification ? "border-destructive" : ""
                    }
                  />
                  {errors.identification && (
                    <p className="text-destructive text-sm">
                      {errors.identification}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    placeholder="Ingrese el nombre completo"
                    value={salesData.customer.name}
                    onChange={(e) =>
                      handleCustomerChange("name", e.target.value)
                    }
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={salesData.customer.email}
                    onChange={(e) =>
                      handleCustomerChange("email", e.target.value)
                    }
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    placeholder="+58 414 123-4567"
                    value={salesData.customer.phone}
                    onChange={(e) =>
                      handleCustomerChange("phone", e.target.value)
                    }
                    className={errors.phone ? "border-destructive" : ""}
                  />
                  {errors.phone && (
                    <p className="text-destructive text-sm">{errors.phone}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    placeholder="Ingrese la dirección completa"
                    value={salesData.customer.address}
                    onChange={(e) =>
                      handleCustomerChange("address", e.target.value)
                    }
                    className={errors.address ? "border-destructive" : ""}
                  />
                  {errors.address && (
                    <p className="text-destructive text-sm">{errors.address}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-2">
                  <Label htmlFor="reference">Referencia (Opcional)</Label>
                  <Input
                    id="reference"
                    placeholder="Punto de referencia cercano"
                    value={salesData.customer.reference}
                    onChange={(e) =>
                      handleCustomerChange("reference", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">País *</Label>
                  <Select
                    value={salesData.customer.country}
                    onValueChange={(value) =>
                      handleCustomerChange("country", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.country ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Venezuela">Venezuela</SelectItem>
                      <SelectItem value="Colombia">Colombia</SelectItem>
                      <SelectItem value="El Salvador">El Salvador</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.country && (
                    <p className="text-destructive text-sm">{errors.country}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">Estado/Departamento *</Label>
                  <Select
                    value={salesData.customer.state}
                    onValueChange={(value) =>
                      handleCustomerChange("state", value)
                    }
                    disabled={!salesData.customer.country}
                  >
                    <SelectTrigger
                      className={errors.state ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-destructive text-sm">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Select
                    value={salesData.customer.city}
                    onValueChange={(value) =>
                      handleCustomerChange("city", value)
                    }
                    disabled={!salesData.customer.state}
                  >
                    <SelectTrigger
                      className={errors.city ? "border-destructive" : ""}
                    >
                      <SelectValue placeholder="Seleccionar ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.city && (
                    <p className="text-destructive text-sm">{errors.city}</p>
                  )}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="seller">Vendedor *</Label>
                    <Input
                      id="seller"
                      placeholder="Nombre del vendedor"
                      value={salesData.order.seller}
                      onChange={(e) =>
                        handleOrderChange("seller", e.target.value)
                      }
                      className={errors.seller ? "border-destructive" : ""}
                    />
                    {errors.seller && (
                      <p className="text-destructive text-sm">
                        {errors.seller}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="salesChannel">Canal de Venta *</Label>
                    <Select
                      value={salesData.order.salesChannel}
                      onValueChange={(value) =>
                        handleOrderChange("salesChannel", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.salesChannel ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Seleccionar canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">En Línea</SelectItem>
                        <SelectItem value="store">Tienda Física</SelectItem>
                        <SelectItem value="phone">Teléfono</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="social">Redes Sociales</SelectItem>
                        <SelectItem value="referral">Referido</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.salesChannel && (
                      <p className="text-destructive text-sm">
                        {errors.salesChannel}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Forma de Pago *</Label>
                    <Select
                      value={salesData.order.paymentMethod}
                      onValueChange={(value) =>
                        handleOrderChange("paymentMethod", value)
                      }
                    >
                      <SelectTrigger
                        className={
                          errors.paymentMethod ? "border-destructive" : ""
                        }
                      >
                        <SelectValue placeholder="Seleccionar forma de pago" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Efectivo</SelectItem>
                        <SelectItem value="credit_card">
                          Tarjeta de Crédito
                        </SelectItem>
                        <SelectItem value="debit_card">
                          Tarjeta de Débito
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          Transferencia Bancaria
                        </SelectItem>
                        <SelectItem value="mobile_payment">
                          Pago Móvil
                        </SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="crypto">Criptomoneda</SelectItem>
                        <SelectItem value="financing">
                          Financiamiento
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.paymentMethod && (
                      <p className="text-destructive text-sm">
                        {errors.paymentMethod}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carrier">Transportista (Opcional)</Label>
                    <Input
                      id="carrier"
                      placeholder="Empresa de transporte"
                      value={salesData.order.carrier || ""}
                      onChange={(e) =>
                        handleOrderChange("carrier", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Order Information */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderDate">Fecha de Orden *</Label>
                    <Input
                      id="orderDate"
                      type="date"
                      value={salesData.order.orderDate}
                      onChange={(e) =>
                        handleOrderChange("orderDate", e.target.value)
                      }
                      className={errors.orderDate ? "border-destructive" : ""}
                    />
                    {errors.orderDate && (
                      <p className="text-destructive text-sm">
                        {errors.orderDate}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderNumber">Número de Orden</Label>
                    <Input
                      id="orderNumber"
                      value={salesData.order.orderNumber}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderType">Tipo de Orden *</Label>
                    <Select
                      value={salesData.order.orderType}
                      onValueChange={(value: "immediate" | "reservation") =>
                        handleOrderChange("orderType", value)
                      }
                    >
                      <SelectTrigger
                        className={errors.orderType ? "border-destructive" : ""}
                      >
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">
                          Compra Inmediata
                        </SelectItem>
                        <SelectItem value="reservation">
                          Reserva/Abono
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.orderType && (
                      <p className="text-destructive text-sm">
                        {errors.orderType}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Fecha de Entrega</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={salesData.order.deliveryDate || ""}
                      onChange={(e) =>
                        handleOrderChange("deliveryDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Product Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="productSearch">Buscar Producto</Label>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateProduct(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Producto
                    </Button>
                  </div>
                  <Input
                    id="productSearch"
                    placeholder="Buscar por código o descripción"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <div key={product.code} className="space-y-2">
                        <Button
                          variant="outline"
                          onClick={() => handleProductSelect(product.code)}
                        >
                          {product.description}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Agregar Producto al Pedido</Label>
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateProduct(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Producto
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="productSelect">Producto</Label>
                      <select
                        id="productSelect"
                        className="w-full rounded-md border p-2"
                        value={selectedProduct?.code || ""}
                        onChange={(e) => {
                          const product = mockProducts.find(
                            (p) => p.code === e.target.value,
                          );
                          if (product) handleProductSelect(product.code);
                        }}
                      >
                        <option value="">Seleccionar producto...</option>
                        {mockProducts.map((product) => (
                          <option key={product.code} value={product.code}>
                            {product.code} - {product.description}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Cantidad</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={productQuantity}
                        onChange={(e) =>
                          setProductQuantity(
                            Number.parseInt(e.target.value) || 1,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unitPrice">Precio Unitario</Label>
                      <Input
                        id="unitPrice"
                        type="number"
                        step="0.01"
                        value={productPrice}
                        onChange={(e) =>
                          setProductPrice(
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discount">Descuento (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        min="0"
                        max="100"
                        value={productDiscount}
                        onChange={(e) =>
                          setProductDiscount(
                            Number.parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>¿Descuento Negociado?</Label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="negotiatedDiscount"
                          checked={hasNegotiatedDiscount}
                          onChange={(e) =>
                            setHasNegotiatedDiscount(e.target.checked)
                          }
                        />
                        <Label htmlFor="negotiatedDiscount">Sí</Label>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={addProductToOrder}
                        disabled={!selectedProduct}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Partial Payments */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="partialPayments">Pagos Parciales</Label>
                    <Button variant="outline" onClick={addPartialPayment}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Pago Parcial
                    </Button>
                  </div>
                  {salesData.order.partialPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center space-x-4"
                    >
                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) =>
                          updatePartialPayment(
                            payment.id,
                            "amount",
                            Number(e.target.value),
                          )
                        }
                      />
                      <Input
                        type="date"
                        value={payment.date}
                        onChange={(e) =>
                          updatePartialPayment(
                            payment.id,
                            "date",
                            e.target.value,
                          )
                        }
                      />
                      <Button
                        variant="destructive"
                        onClick={() => removePartialPayment(payment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Review Customer Data */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Datos del Cliente</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Identificación/Cédula</Label>
                      <p>{salesData.customer.identification}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Nombre Completo</Label>
                      <p>{salesData.customer.name}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <p>{salesData.customer.email}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <p>{salesData.customer.phone}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-2">
                      <Label>Dirección</Label>
                      <p>{salesData.customer.address}</p>
                    </div>
                    <div className="space-y-2 md:col-span-2 lg:col-span-2">
                      <Label>Referencia</Label>
                      <p>{salesData.customer.reference}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>País</Label>
                      <p>{salesData.customer.country}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Estado/Departamento</Label>
                      <p>{salesData.customer.state}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Ciudad</Label>
                      <p>{salesData.customer.city}</p>
                    </div>
                  </div>
                </div>

                {/* Review Order Data */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Detalles del Pedido</h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Vendedor</Label>
                      <p>{salesData.order.seller}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Canal de Venta</Label>
                      <p>{salesData.order.salesChannel}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Forma de Pago</Label>
                      <p>{salesData.order.paymentMethod}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Transportista</Label>
                      <p>{salesData.order.carrier}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Orden</Label>
                      <p>{salesData.order.orderDate}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Número de Orden</Label>
                      <p>{salesData.order.orderNumber}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Orden</Label>
                      <p>{salesData.order.orderType}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Entrega</Label>
                      <p>{salesData.order.deliveryDate}</p>
                    </div>
                  </div>
                </div>

                {/* Review Products */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Productos</h2>
                  {salesData.order.products.map((product) => (
                    <div key={product.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Código</Label>
                        <p>{product.code}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Descripción</Label>
                        <p>{product.description}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Cantidad</Label>
                        <p>{product.quantity}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Precio Unitario</Label>
                        <p>{product.unitPrice}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Descuento (%)</Label>
                        <p>{product.discount}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Total</Label>
                        <p>{product.total}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review Partial Payments */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Pagos Parciales</h2>
                  {salesData.order.partialPayments.map((payment) => (
                    <div key={payment.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Monto</Label>
                        <p>{payment.amount}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Fecha</Label>
                        <p>{payment.date}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Amount */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Total</h2>
                  <div className="flex items-center justify-between">
                    <Label>Monto Total</Label>
                    <p>{calculateOrderTotal()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Monto Pagado Parcialmente</Label>
                    <p>{totalPartialPayments}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Monto Pendiente</Label>
                    <p>{remainingAmount}</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <Button onClick={handleSubmit}>Confirmar Venta</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
          <Button onClick={handleNext} disabled={currentStep === 3}>
            Siguiente
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
